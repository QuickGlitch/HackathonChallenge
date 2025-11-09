<template>
  <div class="container">
    <h1>Products</h1>

    <div v-if="productStore.loading" class="loading">Loading products...</div>

    <div v-else-if="productStore.error" class="alert alert-error">
      {{ productStore.error }}
    </div>

    <div v-else class="grid grid-3">
      <div
        v-for="product in productStore.products"
        :key="product.id"
        class="card product-card"
      >
        <!-- Reseller badge for products not from main store -->
        <div v-if="product.sellerId !== 1" class="reseller-badge">Reseller</div>
        <img :src="product.image" :alt="product.name" class="product-image" />
        <div class="product-info">
          <h3>{{ product.name }}</h3>
          <p class="product-description">{{ product.description }}</p>
          <div class="product-price">${{ product.price.toFixed(2) }}</div>
          <div class="product-actions">
            <router-link
              :to="`/products/${product.id}`"
              class="btn btn-secondary"
            >
              View Details
            </router-link>
            <button @click="addToCart(product)" class="btn">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useProductStore } from "../stores/products";
import { useCartStore } from "../stores/cart";

const productStore = useProductStore();
const cartStore = useCartStore();

function addToCart(product) {
  cartStore.addToCart(product);
}

onMounted(() => {
  productStore.fetchProducts();
});
</script>

<style scoped>
.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.product-card {
  position: relative;
  transition: transform 0.3s;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-4px);
}

.reseller-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
  padding: 4px 8px;
  font-size: 0.65rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.4);
  z-index: 100;
  border: 1px solid rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.product-info h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.product-description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.product-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 1rem;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
}

.product-actions .btn {
  flex: 1;
  text-align: center;
}
</style>
