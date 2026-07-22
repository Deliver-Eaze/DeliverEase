import json
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import User, Category, MenuItem, Order, OrderItem, Payment

def login_view(request):
    return render(request, 'login.html')
    if request.user.is_authenticated:
        if request.user.role == 'chef':
            return redirect('chef')
        elif request.user.role == 'manager':
            return redirect('manager')
        else:
            return redirect('menu')

   
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')
        
       
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            
            login(request, user)
            messages.success(request, f'Welcome {username}!')
            
            
            if user.role == 'chef':
                return redirect('chef')
            elif user.role == 'manager':
                return redirect('manager')
            else:
                return redirect('menu')
        else:
            messages.error(request, 'Invalid username or password.')
    
   




def register_view(request):
    
    if request.user.is_authenticated:
        return redirect('menu')

    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '')
        confirm_password = request.POST.get('confirm_password', '')

      
        if not username or not email or not password:
            messages.error(request, 'All fields are required.')
        elif password != confirm_password:
            messages.error(request, 'Passwords do not match.')
        elif len(password) < 6:
            messages.error(request, 'Password must be at least 6 characters.')
        elif User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists.')
        elif User.objects.filter(email=email).exists():
            messages.error(request, 'Email already registered.')
        else:
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                role='customer'  
            )
            login(request, user)
            messages.success(request, 'Account created successfully!')
            return redirect('menu')

    return render(request, 'register.html')


def logout_view(request):
    
    logout(request)
    messages.info(request, 'You have been logged out.')
    return redirect('login')



@login_required  
def menu_view(request):


    if request.user.role != 'customer':
        if request.user.role == 'chef':
            return redirect('chef')
        elif request.user.role == 'manager':
            return redirect('manager')


    categories = Category.objects.prefetch_related('items').all()

   
    menu_data = []
    for cat in categories:
        for item in cat.items.filter(available=True):  
            menu_data.append({
                'id': item.id,
                'name': item.name,
                'description': item.description,
                'price': float(item.price),  
                'category': cat.name,
                'image': item.image.url if item.image else '/static/images/default-food.png',
            })

    
    context = {
        'categories': categories,
        'menu_json': json.dumps(menu_data)
    }
    return render(request, 'menu.html', context)



@login_required
def cart_view(request):
    
    if request.user.role != 'customer':
        return redirect('login')
    return render(request, 'cart.html')



@login_required
def checkout_view(request):
    
    if request.user.role != 'customer':
        return redirect('login')
    return render(request, 'checkout.html')

@login_required
def chef_view(request):
    
    if request.user.role != 'chef':
        return redirect('login')

    
    orders = Order.objects.filter(
        status__in=['pending', 'preparing', 'ready']
    ).order_by('-created_at')

    return render(request, 'chef_dashboard.html', {'orders': orders})



@login_required
def manager_view(request):
  
    if request.user.role != 'manager':
        return redirect('login')

    from django.db.models import Sum, Count
    from django.utils import timezone
    import datetime

    today = timezone.now().date()
    current_month = today.replace(day=1)

    
    total_orders = Order.objects.count()
    today_orders = Order.objects.filter(created_at__date=today).count()
    monthly_orders = Order.objects.filter(created_at__date__gte=current_month).count()

    
    revenue = Order.objects.filter(status='delivered').aggregate(
        total=Sum('total_price')
    )['total'] or 0

 
    delayed_orders = Order.objects.filter(status__in=['pending', 'preparing']).count()

    
    recent_orders = Order.objects.all().order_by('-created_at')[:10]

    context = {
        'total_orders': total_orders,
        'today_orders': today_orders,
        'monthly_orders': monthly_orders,
        'revenue': revenue,
        'delayed_orders': delayed_orders,
        'recent_orders': recent_orders,
    }
    return render(request, 'manager_dashboard.html', context)



@csrf_exempt
@login_required
def api_update_order_status(request, order_id):
    
    if request.user.role not in ['chef', 'manager']:
        return JsonResponse({'success': False, 'error': 'Not authorized'})

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            new_status = data.get('status')
            order = Order.objects.get(id=order_id)
            order.status = new_status
            order.save()
            return JsonResponse({'success': True})
        except Order.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Order not found'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})

    return JsonResponse({'success': False, 'error': 'Invalid method'})


@csrf_exempt
@login_required
def api_place_order(request):
 
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid method'})

    try:
        
        data = json.loads(request.body)
        address = data.get('address', '').strip()
        phone = data.get('phone', '').strip()
        method = data.get('method', 'cod')
        cart_items = data.get('cart', [])

        
        if not address or not phone:
            return JsonResponse({'success': False, 'error': 'Address and phone are required'})
        if not cart_items:
            return JsonResponse({'success': False, 'error': 'Cart is empty'})

        
        order = Order.objects.create(
            customer=request.user,
            delivery_address=address,
            total_price=0,  
            status='pending'
        )

       
        total = 0
        for item in cart_items:
            try:
                menu_item = MenuItem.objects.get(id=item['id'], available=True)
                quantity = int(item['quantity'])
                item_total = menu_item.price * quantity
                
                OrderItem.objects.create(
                    order=order,
                    menu_item=menu_item,
                    quantity=quantity,
                    item_price=menu_item.price
                )
                total += item_total
            except MenuItem.DoesNotExist:
                continue

        
        order.total_price = total
        order.save()

        
        Payment.objects.create(
            order=order,
            method=method,
            is_paid=False
        )

        
        return JsonResponse({
            'success': True,
            'order_id': order.id,
            'total': float(total),
            'message': 'Order placed successfully!'
        })

    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})



@csrf_exempt
def api_login(request):
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username', '')
            password = data.get('password', '')
            
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                login(request, user)
                
                
                if user.role == 'chef':
                    redirect_url = '/chef/'
                elif user.role == 'manager':
                    redirect_url = '/manager/'
                else:
                    redirect_url = '/menu/'
                
                return JsonResponse({
                    'success': True,
                    'redirect': redirect_url,
                    'role': user.role
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid username or password'
                })
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid JSON'})
    
    return JsonResponse({'success': False, 'error': 'Invalid method'})


@csrf_exempt
def api_register(request):
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '')

            if not username or not email or not password:
                return JsonResponse({'success': False, 'error': 'All fields are required'})
            if User.objects.filter(username=username).exists():
                return JsonResponse({'success': False, 'error': 'Username already exists'})
            if User.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'error': 'Email already registered'})

            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                role='customer'
            )
            login(request, user)
            return JsonResponse({'success': True, 'redirect': '/menu/'})
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid JSON'})

    return JsonResponse({'success': False, 'error': 'Invalid method'})