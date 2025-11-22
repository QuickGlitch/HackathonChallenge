<template>
  <div class="container">
    <h1>Shopping Cart</h1>

    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <p>Your cart is empty</p>
      <router-link to="/products" class="btn">Continue Shopping</router-link>
    </div>

    <div v-else>
      <div class="cart-items">
        <div
          v-for="item in cartStore.items"
          :key="item.id"
          class="cart-item card"
        >
          <img :src="item.image" :alt="item.name" class="item-image" />
          <div class="item-details">
            <h3>{{ item.name }}</h3>
            <p class="item-price">${{ item.price.toFixed(2) }} each</p>
          </div>
          <div class="item-quantity">
            <button
              @click="updateQuantity(item.id, item.quantity - 1)"
              class="btn btn-secondary"
            >
              -
            </button>
            <span class="quantity">{{ item.quantity }}</span>
            <button
              @click="updateQuantity(item.id, item.quantity + 1)"
              class="btn btn-secondary"
            >
              +
            </button>
          </div>
          <div class="item-total">
            ${{ (item.price * item.quantity).toFixed(2) }}
          </div>
          <button @click="removeItem(item.id)" class="btn-remove">×</button>
        </div>
      </div>

      <div class="cart-summary card">
        <h3>Order Summary</h3>
        <div class="summary-row">
          <span>Total Items:</span>
          <span>{{ cartStore.itemCount }}</span>
        </div>
        <div class="summary-row total">
          <span>Total Price:</span>
          <span>${{ cartStore.totalPrice.toFixed(2) }}</span>
        </div>
        <div class="cart-actions">
          <button @click="clearCart" class="btn btn-secondary">
            Clear Cart
          </button>
          <router-link to="/checkout" class="btn"
            >Proceed to Checkout</router-link
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from "../stores/cart";

const cartStore = useCartStore();

function updateQuantity(productId, quantity) {
  cartStore.updateQuantity(productId, quantity);
}

function removeItem(productId) {
  cartStore.removeFromCart(productId);
}

function clearCart() {
  cartStore.clearCart();
}
</script>

<style scoped>
.empty-cart {
  text-align: center;
  padding: 3rem;
}

.empty-cart p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #666;
}

.cart-items {
  margin-bottom: 2rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  position: relative;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details {
  flex: 1;
}

.item-details h3 {
  margin-bottom: 0.5rem;
}

.item-price {
  color: #666;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity {
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  min-width: 40px;
  text-align: center;
}

.item-total {
  font-weight: bold;
  font-size: 1.1rem;
  color: #60a5fa;
  min-width: 100px;
  text-align: right;
}

.btn-remove {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #dc3545;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove:hover {
  background: #c82333;
}

.cart-summary {
  max-width: 400px;
  margin-left: auto;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.summary-row.total {
  font-weight: bold;
  font-size: 1.2rem;
  border-top: 1px solid #ddd;
  padding-top: 0.5rem;
  margin-top: 1rem;
}

.cart-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.cart-actions .btn {
  flex: 1;
  text-align: center;
}
</style>
