from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
   class Role(models.TextChoices):
     CUSTOMER ='customer','customer'
     CHEF='chef','chef'
     MANAGER ='manager','manager'
   
   role=models.CharField(max_length = 20,choices=Role.choices, default = Role.CUSTOMER)
def _str_(self):
  return f"{self.username}({self.get_role_display()})" 
class Category(models.Model):
   name=models.CharField(max_length=100)
   slug=models.SlugField(unique=True)
   class Meta:
     verbose_name_plural="Categories"
   def _str_(self):
      return self.name 
class MenuItem(models.Model):
    category=models.ForeignKey(Category,on_delete=models.CASCADE,related_name='items')
    name=models.CharField(max_length=200)
    description=models.TextField(blank=True)
    price=models.DecimalField(max_digits=6,decimal_places=2)
    image=models.ImageField(upload_to='menu_images/',blank=True,null=True)
    available=models.BooleanField(default=True)
    def _str_(self):
      return self.name
class Order(models.Model):
     STATUS_CHOICES=[
       ('pending','Pending'),
       ('preparing','Preparing'),
       ('ready','Ready'),
       ('out_for_delivered','out for delivered'),
       ('delivered','Delivered'),
       ('canclelled','Cancelled')]
     customer=models.ForeignKey(User, on_delete=models.CASCADE,related_name='orders')
     delivery_address=models.TextField()
     total_price=models.DecimalField(max_digits=8,decimal_places=2,default=0)
     status=models.CharField(max_length=20,choices=STATUS_CHOICES,default='pending')
     created_at=models.DateTimeField(auto_now_add=True)
     def _str_(self):
         return f"Order #{self.id}"
class OrderItem(models.Model):
     order=models.ForeignKey(Order,on_delete=models.CASCADE,related_name='items')
     menu_item=models.ForeignKey(MenuItem,on_delete=models.CASCADE)
     quantity=models.IntegerField(default=1)
     item_price=models.DecimalField(max_digits=6,decimal_places=2)
     def _str_(self):
       return f"{self.menu_item.name} x{self.quantity}"

class Payment(models.Model):
     METHOD_CHOICES=[ 
       ('cod','Cash on Delivery'),
       ('online','Online Payment'),]
     order=models.OneToOneField(Order, on_delete=models.CASCADE,related_name='payment') 
     method=models.CharField(max_length=20,choices=METHOD_CHOICES)
     is_paid=models.BooleanField(default=False)
     receipt=models.ImageField(upload_to='receipts/',blank=True,null=True)
     paid_at=models.DateTimeField(auto_now_add=True)
     def _str_(self):
       return f"Payment for {self.order}"  