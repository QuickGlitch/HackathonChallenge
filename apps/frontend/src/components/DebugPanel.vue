<!-- 
  DEVELOPMENT ONLY - Remove before production!
  This component contains temporary debug features and admin shortcuts
  TODO: Implement proper admin authentication
  FIXME: Remove hardcoded admin credentials
-->

<template>
  <div class="admin-debug" v-if="showDebugPanel">
    <div class="debug-panel">
      <h3>🔧 Development Debug Panel</h3>
      <p class="warning">⚠️ For internal use only</p>

      <!-- Fake admin login that logs attempts -->
      <div class="admin-quick-login">
        <h4>Quick Admin Access</h4>
        <form @submit.prevent="attemptAdminLogin">
          <input
            v-model="debugCredentials.username"
            placeholder="Admin Username (try: admin)"
            class="debug-input"
          />
          <input
            v-model="debugCredentials.password"
            type="password"
            placeholder="Admin Password (try: admin123)"
            class="debug-input"
          />
          <button type="submit" class="debug-btn">Quick Login</button>
        </form>
      </div>

      <!-- Fake product testing section -->
      <div class="product-test">
        <h4>Hidden Products Access</h4>
        <button @click="fetchHiddenProducts" class="debug-btn">
          Fetch Hidden Products
        </button>
        <p class="hint">Loads all products + special honey collection</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useProductStore } from "../stores/products.js";

export default {
  name: "DebugPanel",
  data() {
    return {
      showDebugPanel: false,
      debugCredentials: {
        username: "",
        password: "",
      },
      // Fake flag that makes it look like debug mode can be enabled
      debugModeEnabled: window.location.hostname === "localhost",
    };
  },
  mounted() {
    // Check for debug parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (
      urlParams.get("debug") === "true" ||
      urlParams.get("admin") === "true"
    ) {
      this.showDebugPanel = true;
      console.log("[DEBUG] Admin debug panel enabled");
    }

    // Fake debug logging that might attract attention
    console.log("[DEBUG] Available debug endpoints:");
    console.log("[DEBUG] /api/admin/secret-admin-login");
    console.log("[DEBUG] Hidden products feature enabled");
  },
  methods: {
    attemptAdminLogin() {
      // This is a honeypot - log the attempt and always fail
      console.log(
        "[HONEYPOT] Frontend admin login attempt:",
        this.debugCredentials
      );

      // Make fake API call that will be logged on backend
      fetch("/api/admin/secret-admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.debugCredentials),
      })
        .then((response) => response.json())
        .then((data) => {
          alert("Login failed: " + data.error);
        })
        .catch((err) => {
          console.error("Login error:", err);
        });
    },

    async fetchHiddenProducts() {
      try {
        // Log the honeypot activity
        console.log("[HONEYPOT] Attempting to fetch hidden products");

        // First, fetch real products from the API
        const response = await fetch("/api/products");
        const realProducts = await response.json();

        // Create fake honey-themed products to append
        const fakeProducts = [
          {
            id: 99991,
            name: "Honey-Based Skin Cream",
            description:
              "Premium organic honey facial moisturizer with anti-aging properties. Made from rare Manuka honey.",
            price: 89.99,
            image:
              "https://via.placeholder.com/300x200/FFD700/000000?text=Honey+Cream",
            category: "Beauty",
            sellerId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 99992,
            name: "Premium Honey Receptacle",
            description:
              "Hand-crafted wooden honey jar with traditional bee motifs. Perfect for storing artisanal honey.",
            price: 45.5,
            image:
              "https://via.placeholder.com/300x200/8B4513/FFD700?text=Honey+Jar",
            category: "Kitchen",
            sellerId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 99993,
            name: "Royal Honey Elixir",
            description:
              "Concentrated honey supplement with royal jelly and propolis. Boost your immunity naturally.",
            price: 124.99,
            image:
              "https://via.placeholder.com/300x200/FFD700/8B0000?text=Honey+Elixir",
            category: "Health",
            sellerId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 99994,
            name: "Honeycomb Memory Foam Pillow",
            description:
              "Ergonomic pillow with honeycomb ventilation design. Infused with honey-scented aromatherapy.",
            price: 67.75,
            image:
              "https://via.placeholder.com/300x200/FFFACD/000000?text=Honey+Pillow",
            category: "Home",
            sellerId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

        // Combine real and fake products
        const allProducts = [...realProducts, ...fakeProducts];

        // Update the products store properly
        const productsStore = useProductStore();
        productsStore.setProducts(allProducts);

        console.log(
          `[HONEYPOT] Loaded ${realProducts.length} real products + ${fakeProducts.length} hidden honey products`
        );
        alert(
          `Successfully fetched ${allProducts.length} products including ${fakeProducts.length} premium tier`
        );
      } catch (error) {
        console.error("[HONEYPOT] Error fetching hidden products:", error);
        alert("Failed to fetch hidden products: " + error.message);
      }
    },
  },
};
</script>

<style scoped>
.admin-debug {
  position: fixed;
  top: 10px;
  right: 10px;
  background: #f0f0f0;
  border: 2px solid #ff6b6b;
  border-radius: 8px;
  padding: 16px;
  max-width: 300px;
  z-index: 9999;
  font-size: 12px;
}

.debug-panel h3 {
  margin: 0 0 8px 0;
  color: #d63031;
}

.warning {
  color: #e17055;
  font-weight: bold;
  margin: 4px 0;
}

.debug-input {
  width: 100%;
  padding: 4px;
  margin: 4px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.debug-btn {
  background: #fd79a8;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin: 2px;
  color: white;
  font-size: 11px;
}

.debug-btn:hover {
  background: #e84393;
}

.admin-quick-login,
.product-test {
  margin: 12px 0;
  padding: 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.admin-quick-login h4,
.product-test h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #2d3436;
}

.hint {
  font-size: 10px;
  color: #636e72;
  margin: 4px 0 0 0;
  font-style: italic;
}
</style>
