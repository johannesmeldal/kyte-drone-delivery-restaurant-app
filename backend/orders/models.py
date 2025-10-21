from django.db import models
from django.utils import timezone

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('delayed', 'Delayed'),
        ('cancelled', 'Cancelled'),
        ('ready', 'Ready'),  # New status for food ready for pickup
        ('completed', 'Completed'),
    ]
    
    id = models.CharField(max_length=50, primary_key=True)
    display_number = models.IntegerField(unique=True, null=True, blank=True)  # 3-digit friendly number
    customer_name = models.CharField(max_length=100)
    customer_phone = models.CharField(max_length=20)
    delivery_address = models.TextField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    ready_at = models.DateTimeField(null=True, blank=True)  # When food became ready
    completed_at = models.DateTimeField(null=True, blank=True)
    special_instructions = models.TextField(blank=True, null=True)
    
    def save(self, *args, **kwargs):
        # Auto-assign display_number if not set
        if not self.display_number:
            # Get the highest display_number and add 1, cycling back to 100 if > 999
            last_order = Order.objects.order_by('-display_number').first()
            if last_order and last_order.display_number:
                next_num = last_order.display_number + 1
                self.display_number = next_num if next_num <= 999 else 100
            else:
                self.display_number = 100  # Start at 100
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Order #{self.display_number} - {self.customer_name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    special_instructions = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.quantity}x {self.name}"
