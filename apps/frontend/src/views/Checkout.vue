<template>
  <div class="container">
    <div class="checkout-view">
      <h1 class="header">Checkout</h1>

      <div v-if="!authStore.isLoggedIn" class="empty-cart">
        <h3>Login Required</h3>
        <p>You must be logged in to place an order.</p>
        <router-link to="/login" class="btn">Login</router-link>
      </div>

      <div v-else-if="orderComplete" class="empty-cart">
        <h3>Order Placed Successfully!</h3>
        <p>Thank you for your purchase. Your order ID is: {{ orderId }}</p>
        <router-link to="/products" class="btn">Continue Shopping</router-link>
      </div>

      <div class="checkout-goodies" v-else>
        <div class="checkout-form card">
          <h3>Billing Information</h3>
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

            <h3 class="payment-section">Payment Information</h3>

            <div class="form-group">
              <label class="form-label">Card Number</label>
              <input
                type="text"
                class="form-input"
                value="4111111111111111"
                disabled
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Expiry Date</label>
                <input type="text" class="form-input" value="12/55" disabled />
              </div>

              <div class="form-group">
                <label class="form-label">CVV</label>
                <input type="text" class="form-input" value="123" disabled />
              </div>
            </div>

            <button type="submit" class="btn" :disabled="processing">
              {{ processing ? "Processing..." : "Place Order" }}
            </button>
          </form>
        </div>

        <div class="order-summary card">
          <h3>Order Summary</h3>
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="summary-row"
          >
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <span class="item-total"
              >${{ (item.price * item.quantity).toFixed(2) }}</span
            >
          </div>
          <div class="summary-row total">
            <span>Total Price:</span>
            <span>${{ cartStore.totalPrice.toFixed(2) }}</span>
          </div>
        </div>
      </div>
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
.checkout-view {
  margin-top: 2rem;
  width: 100%;
}

.checkout-goodies {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 2rem;
}

.header {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #1e3a8a;
}

.empty-cart {
  text-align: center;
  padding: 3rem;
}

.empty-cart h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #1e3a8a;
}

.empty-cart p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #666;
}

.checkout-form {
  flex-grow: 1;
  margin-bottom: 2rem;
}

.checkout-form h3 {
  margin-bottom: 1.5rem;
  color: #1e3a8a;
  font-size: 1.3rem;
}

.payment-section {
  margin-top: 2rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.order-summary {
  max-width: 400px;
  margin-left: auto;
}

.order-summary h3 {
  margin-bottom: 1rem;
  color: #1e3a8a;
  font-size: 1.3rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.summary-row.total {
  font-weight: bold;
  font-size: 1.2rem;
  border-top: 1px solid #ddd;
  border-bottom: none;
  padding-top: 0.5rem;
  margin-top: 1rem;
}

.item-total {
  font-weight: bold;
  color: #60a5fa;
}
</style>
