from django.urls import path 
from . import views

urlpatterns=[
    path('',views.login_view,name='login'),
    path('register/',views.register_view,name='register'),
    path('logout/',views.logout_view,name='logout'),
    path('menu/',views.menu_page,name='menu'),
    path('cart/',views.cart_page,name='cart'),
    path('checkout/',views.checkout_page,name='checkout'),
    path('chef/',views.chef_page,name='chef'),
    path('manager/',views.manager_page,name='manager'),
]