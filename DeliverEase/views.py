from django.shortcuts import render , redirect
from django.contrib.auth import authenticate , login , logout
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

def login_view(request):
    if request.user.is_authenticated:
       if request.user.role=='chef':
          return redirect('chef')
       elif request.user.role=='manager':
          return redirect('manager')
       else :
          return redirect('menu')
    if request.method=='POST':
       username = request.POST.get('username')
       password = request.POST.get('password')
       user = authenticate(request,username=username,password=password)
       if user is not None:
          login(request,user)
          if hasattr(user,'role'):
            if user.role=='chef':
              return redirect('chef')
            elif user.role=='manager':
              return redirect('manager')
            else :
              return redirect('menu')
       else:
         messages.error(request,'invalid username or password')  
         return render(request,'login.html')
    

def register_view(request):
    if request.method=='POST':
       username = request.POST['username']
       password = request.POST['password']
       email = request.POST['email']
       User.objects.create_user(username=username,email=email,password=password)
       message.success(request,'Account created !') 
       return redirect('login')

    return render(request,'register.html')


def logout_view(request):
    logout(request)
    return redirect('login')

def menu_page(request):
    return render(request,'menu.html')

def cart_page(request):
    return render(request,'cart.html')

def checkout_page(request):
    return render(request,'checkout.html')

def chef_page(request):
    return render(request,'chef_dashboard.html')

def manager_page(request):
    return render(request,'manager_dashboard.html')

@csrf_exempt
def api_place_order(request):
    if request.method == 'POST':
       data = json.loads(request.body)
       
       return JsonResponse({
          'success':True,
          'order_id':123
})
    return JsonResponse({'success':False,'error':'Invalid request'})





