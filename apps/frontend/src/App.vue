<template>
  <div id="app">
    <!-- Hidden debug panel (honeypot) -->
    <DebugPanel v-if="showDebugPanel" />

    <header class="header">
      <div class="container">
        <h1 class="logo">🛒 Hackathon Store</h1>
        <nav class="nav">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/products" class="nav-link">Products</router-link>
          <router-link to="/cart" class="nav-link"
            >Cart ({{ cartStore.itemCount }})</router-link
          >
          <router-link
            v-if="authStore.isLoggedIn"
            to="/reseller"
            class="nav-link"
          >
            Reseller
          </router-link>
          <router-link
            v-if="!authStore.isLoggedIn"
            to="/login"
            class="nav-link"
          >
            Login
          </router-link>
          <router-link
            v-if="authStore.isLoggedIn"
            to="/logout"
            class="nav-link"
          >
            Logout
          </router-link>
        </nav>
      </div>
    </header>

    <main class="main">
      <router-view />
    </main>

    <footer class="footer">
      <div class="container">
        <p>&copy; 2025 Hackathon Store - For Educational Purposes Only</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import DebugPanel from "./components/DebugPanel.vue";
import { useCartStore } from "./stores/cart";
import { useAuthStore } from "./stores/auth";

const cartStore = useCartStore();
const authStore = useAuthStore();

// Honeypot: Show debug panel based on URL parameters
const showDebugPanel = ref(false);

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("debug") === "true" || urlParams.get("admin") === "true") {
    showDebugPanel.value = true;
  }
});

// Auth store now initializes automatically when created
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
}

.main {
  min-height: calc(100vh - 120px);
  padding: 2rem 0;
}

.footer {
  background-color: #333;
  color: white;
  text-align: center;
  padding: 1rem 0;
}
</style>
