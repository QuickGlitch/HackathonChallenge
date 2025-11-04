<template>
  <div class="container">
    <div v-if="loading" class="loading">Loading product...</div>

    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <div v-else-if="product" class="product-detail">
      <div class="grid grid-2">
        <div>
          <img :src="product.image" :alt="product.name" class="product-image" />
        </div>
        <div class="product-info">
          <h1>{{ product.name }}</h1>
          <p class="product-description">{{ product.description }}</p>
          <div class="product-price">${{ product.price.toFixed(2) }}</div>
          <div class="product-actions">
            <button @click="addToCart(product)" class="btn">Add to Cart</button>
            <router-link to="/products" class="btn btn-secondary">
              Back to Products
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useProductStore } from "../stores/products";
import { useCartStore } from "../stores/cart";

const route = useRoute();
const productStore = useProductStore();
const cartStore = useCartStore();

const product = ref(null);
const loading = ref(false);
const error = ref(null);

function addToCart(product) {
  cartStore.addToCart(product);
}

onMounted(async () => {
  try {
    loading.value = true;
    product.value = await productStore.fetchProduct(route.params.id);
  } catch (err) {
    error.value = "Failed to load product";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.product-detail {
  padding: 2rem 0;
}

.product-image {
  width: 100%;
  border-radius: 8px;
}

.product-info h1 {
  margin-bottom: 1rem;
  color: #333;
}

.product-description {
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
  font-size: 1.1rem;
}

.product-price {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 2rem;
}

.product-actions {
  display: flex;
  gap: 1rem;
}

.product-actions .btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}
</style>
