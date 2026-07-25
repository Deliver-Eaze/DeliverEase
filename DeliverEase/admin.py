from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin 
from .models import User , Category , MenuItem , Order , OrderItem, Payment

class UserAdmin(BaseUserAdmin):
   list_display = ('username', 'email','role' , 'is_staff')
   fieldsets = BaseUserAdmin.fieldsets +(('Role',{'fields':('role',)}),
   )

admin.site.register(User,UserAdmin)
admin.site.register(Category)
admin.site.register(MenuItem )
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Payment)

