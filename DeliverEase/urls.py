from django.urls import path 
from . import views

urlpatterns=[
    path('',views.login_view,name='login'),
    path('register/',views.register_view,name='register'),
    path('logout/',views.logout_view,name='logout'),
    path('menu/',views.menu_view,name='menu'),
    path('cart/',views.cart_view,name='cart'),
    path('checkout/',views.checkout_view,name='checkout'),
    path('chef/',views.chef_view,name='chef'),
    path('manager/',views.manager_view,name='manager'),
    path('api/login/',views.api_login,name='api_login'),
    path('api/register/',views.api_register,name='api_register'),
    path('api/place-order/',views.api_place_order,name='api_place_order'),
    path('api/order/<int:order_id>/status/',views.api_update_order_status,name='api_update_order_status'),
]