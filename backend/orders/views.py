from rest_framework import generics, status
from rest_framework.response import Response
from django.conf import settings
import requests
import logging
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer

logger = logging.getLogger(__name__)

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
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer

class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    def patch(self, request, *args, **kwargs):
        from django.utils import timezone
        
        order = self.get_object()
        new_status = request.data.get('status')
        cancelled_by = request.data.get('cancelled_by')
        
        if new_status in ['accepted', 'rejected', 'delayed', 'cancelled', 'completed']:
            old_status = order.status
            order.status = new_status
            
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
