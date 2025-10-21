from rest_framework import generics, status
from rest_framework.response import Response
from django.conf import settings
import requests
import logging
import hashlib
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer

logger = logging.getLogger(__name__)

def order_list_etag(request):
    """Generate ETag for order list based on latest update and count"""
    orders = Order.objects.all().order_by('-updated_at')
    if not orders.exists():
        return None
    latest = orders.first().updated_at.isoformat()
    count = orders.count()
    etag_source = f"{latest}-{count}"
    return hashlib.md5(etag_source.encode()).hexdigest()

def notify_kyte_backend(order_id, order_status):
    """Send webhook notification to Kyte backend when order status changes"""
    try:
        webhook_url = f"{settings.KYTE_BACKEND_URL}/webhook/order-status"
        payload = {
            "order_id": order_id,
            "status": order_status
        }
        
        response = requests.post(
            webhook_url,
            params=payload,
            timeout=5
        )
        
        if response.status_code == 200:
            logger.info(f"Successfully notified Kyte backend: Order {order_id} -> {order_status}")
        else:
            logger.warning(f"Kyte backend returned status {response.status_code} for order {order_id}")
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to notify Kyte backend for order {order_id}: {str(e)}")
        # Don't fail the request if webhook fails

class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        """Support delta updates with 'since' parameter"""
        queryset = Order.objects.all().order_by('-created_at')
        since = self.request.query_params.get('since', None)
        if since:
            queryset = queryset.filter(updated_at__gt=since)
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Add ETag and conditional response support"""
        # Generate ETag for current data state
        etag = order_list_etag(request)
        
        # Check If-None-Match header for conditional GET
        if_none_match = request.META.get('HTTP_IF_NONE_MATCH', '').strip('"')
        
        if etag and if_none_match == etag:
            # Data hasn't changed, return 304 Not Modified
            return Response(status=304)
        
        # Data has changed or no ETag provided, return full response
        response = super().list(request, *args, **kwargs)
        
        # Add ETag header
        if etag:
            response['ETag'] = f'"{etag}"'
        
        # Add Last-Modified header
        queryset = self.get_queryset()
        if queryset.exists():
            latest_update = queryset.order_by('-updated_at').first()
            response['Last-Modified'] = latest_update.updated_at.strftime('%a, %d %b %Y %H:%M:%S GMT')
        
        return response

class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    def patch(self, request, *args, **kwargs):
        from django.utils import timezone
        
        order = self.get_object()
        new_status = request.data.get('status')
        cancelled_by = request.data.get('cancelled_by')
        
        if new_status in ['accepted', 'rejected', 'delayed', 'cancelled', 'ready', 'completed']:
            old_status = order.status
            order.status = new_status
            
            # Set ready_at timestamp when order is marked as ready
            if new_status == 'ready' and old_status != 'ready':
                order.ready_at = timezone.now()
            
            # Set completed_at timestamp when order is marked as completed
            if new_status == 'completed' and old_status != 'completed':
                order.completed_at = timezone.now()
            
            order.save()
            
            # Only send webhook if status was changed by restaurant, not by Kyte
            if cancelled_by != 'kyte':
                notify_kyte_backend(order.id, new_status)
            
            return Response(OrderSerializer(order).data)
        
        return Response(
            {'error': 'Invalid status'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
