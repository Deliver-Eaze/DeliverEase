let car = [];
document.addEventListener('DomContentLoaded',function(){
const addButtons = document.querySelectorAll('.add-to-cart-btn');
addButtons.forEach(function(button){
   button.addEventListener('click',function(){
    const id = this.getAttribute('data-id');
    const name = this.getAttribute(data-name');
    const price = this.getAttribute(data-price');
    addToCart(id,name,price);
});
});

const goToCartBtn = document.getElementById('go-to-cart-btn');
if(goToCartBtn){
goToCartBtn.addEventListener('click',function(){
localStorage.setItem('cart',JSON.stringify(cart));
window.location.href = '/cart/';
});

const cartContainer = document.getElementById('cart-item');
if(cartContainer){
 cart = JSON.parse(localStorage.getItem('cart'))||[];
displaycart();
}
const checkoutBtn = document.getElementById('checkout-btn');
if(checkoutBtn){
checkoutBtn.addEventListener('click',function(){
if(cart.length === 0){
alert('Your cart is empty !');
return;
}
window.location.href = '/checkout/';
});
}
const checkoutForm = document.getElementById('checkout-form');
if(checkoutForm){
 cart = JSON.parse(localStorage.getItem('cart'))||[];
displayOrderSummary();
}

const paymentMethod = document.getElementById('payment-method');
const receiptGroup = document.getElementById('recipt-group');
if(paymentMethod && receiptGroup){
 paymentMethod.addEventListener('change',function(){
      receiptGroup.style.display = this.value=== 'online' ? 'block':'none';
});

}
checkoutForm.addEventListener('submit' , placeOrder);
}
});


function addToCart(id,name,price){
  const existing = cart.find(function(item){
    return item.id === id;
});

if(existing){
existing.quantity += 1;
}
else{
cart.push({
id:id,
name:name,
price:parseFloat(price),
quantity :1
});
}
alert(name + 'added to cart (!' + cart.length +'items total)');
localStorage.setItem('cart',JSON.stringify(cart));
}

function displayCart(){
const container = document.getElementById('cart-item');
const totalElement = document.getElementById('cart-total');

if(cart.length ===0){
container.innerHTML='<p class="text-center text-muted">Your cart is empty</p>';
if(totalElement) totalElement.textContent ='Total : $0.00';
return;
}
let total=0;
let html='';
cart.forEach(function(item){
  const subtotal = item.price * item.quantity;
  total += subtotal;
  html +='<div class="d-flex justify-content-between align-item-center border-bottom py-2">
<div>
<span class="fw-bold">${item.name}</span>
<small class="text-muted">x${item.quantity}</small>
</div>
<div><span class="fw-bold">$${subtotal.toFixed(2)}</span>
<button class="btn btn-sm btn-outline-danger ms-2 " onclick="removeFromCart('${item.id}')">Remove </button>
</div>
</div>';
});
container.innerHTML = html;
if(totalElement) totalElement.textContent='Total:$'+ total.toFixed(2);
}

function removeFromCart(id){
 cart = cart.filter(function(item){
   return item.id !== id;
});
localStorage.setItem('cart',JSON.stringify(cart));
displayCart();
}

function displayOrderSummary(){
const symmaryContainer = document.getElementById('order-summary');
if(!symmaryContainer) return;
let total=0;
let html='';

cart.forEach(function(item){
const subtotal = item.price * item.quantity;
total +=subtotal;
html +='<div class="d-flex justify-content-between">
<span>${item.name} x${item.quantity} </span>
<span>$${subtotal.toFixed(2)}</span>
</div>';
});
html +='<hr>';
html +='<div class="d-flex justify-content-between fw_bold">
<span>Total</span>
<span>$${total.toFixed(2))</span>
</div>';
summaryContainer.innerHTML=html;
}

function placeOrder(e){
e.preventDefault();

const address=document.getElementById('address').value;
const phone = document.getElementById('phone').value;
const method= document.getElementById('pyment-method').value;

if(!address || !phone){
alert('Please fill in all fields');
return;
}
if(cart.length ===0){
alert('Your cart is empty!');
return;
}

const xhr= new  XMLHttpRequest();
xhr.open('POST','/api/place-order/',true);
xhr.setRequestHeader('Content-Type','application/json');
xhr.setRequestHeader('X-CSRFToken',getCSRFToken());
xhr.onreadystatechange = function(){
if(xhr.readyState===4){
 if(xhr.status===200){
const data = JSON.parse(xhr.responseText);
if(data.success){
localStorage.removeItem('cart');
cart =[];
alter('Order placed successfully ! Order'+data.order_id);
window.location.href='/menu/';
}
else{
alter("Error : " + data.error);
}
}
else{
alter('Server error . please try again .');
}
}
};

const requestData=JSON.stringify({
address:address;
phone:phone;
method:method;
cart:cart});
xhr.send(requestData);
}

function getCSRFToken(){
const cookies = document.cookie.split(';');
for(let i=0 ; i < cookies.length;i++){
const cookie = cookies[i].trim();
if(cookie.startsWith('csrftoken=')){
return cookie.substring('csrftoken='.length);
}
}
return '';
}

