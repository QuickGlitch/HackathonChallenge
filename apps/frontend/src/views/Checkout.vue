<template>
  <div class="container">
    <h1>Checkout</h1>

    <div v-if="!authStore.isLoggedIn" class="alert alert-error">
      <h3>Login Required</h3>
      <p>You must be logged in to place an order.</p>
      <router-link to="/login" class="btn">Login</router-link>
    </div>

    <div v-else class="grid grid-2">
      <div class="checkout-form card">
        <h2>Billing Information</h2>
        <form @submit.prevent="submitOrder">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input
              v-model="form.name"
              type="text"
              class="form-input"
              required
            />
          </div>

          <button type="submit" class="btn" :disabled="processing">
            {{ processing ? "Processing..." : "Place Order" }}
          </button>
        </form>
      </div>

      <div class="order-summary card">
        <h2>Order Summary</h2>
        <div
          v-for="item in cartStore.items"
          :key="item.id"
          class="summary-item"
        >
          <span>{{ item.name }} × {{ item.quantity }}</span>
          <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
        </div>
        <div class="summary-total">
          <strong>Total: ${{ cartStore.totalPrice.toFixed(2) }}</strong>
        </div>
      </div>
    </div>

    <div v-if="orderComplete" class="alert alert-success">
      <h3>Order Placed Successfully!</h3>
      <p>Thank you for your purchase. Your order ID is: {{ orderId }}</p>
      <router-link to="/products" class="btn">Continue Shopping</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCartStore } from "../stores/cart";
import { useAuthStore } from "../stores/auth";
import { apiFetch } from "@/utils/api";

const cartStore = useCartStore();
const authStore = useAuthStore();

// Ensure auth is initialized when component mounts
onMounted(() => {
  authStore.ensureInitialized();
});

const form = ref({
  name: "",
  email: "",
  address: "",
  city: "",
  zipCode: "",
  cardNumber: "",
  expiryDate: "",
  cvv: "",
});

const processing = ref(false);
const orderComplete = ref(false);
const orderId = ref(null);

async function submitOrder() {
  processing.value = true;

  try {
    const orderData = {
      items: cartStore.items,
      total: cartStore.totalPrice,
      customer: {
        name: form.value.name,
        email: form.value.email,
        address: form.value.address,
        city: form.value.city,
        zipCode: form.value.zipCode,
      },
      payment: {
        cardNumber: form.value.cardNumber,
        expiryDate: form.value.expiryDate,
        cvv: form.value.cvv,
      },
    };

    const response = await apiFetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error("Failed to place order");
    }

    const data = await response.json();
    orderId.value = data.id;
    orderComplete.value = true;
    cartStore.clearCart();
  } catch (error) {
    console.error("Order submission failed:", error);
    alert("Failed to place order. Please try again.");
  } finally {
    processing.value = false;
  }
}
</script>

<style scoped>
.checkout-form h2,
.order-summary h2 {
  margin-bottom: 1rem;
}

.checkout-form h3 {
  margin: 2rem 0 1rem 0;
  color: #667eea;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.summary-total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #667eea;
  font-size: 1.2rem;
}

.alert {
  margin-top: 2rem;
  text-align: center;
}

.alert h3 {
  margin-bottom: 1rem;
}

.alert p {
  margin-bottom: 1rem;
}
</style>
