<!-- 
  DEVELOPMENT ONLY - Remove before production!
  This component contains temporary debug features and admin shortcuts
  TODO: Implement proper admin authentication
  FIXME: Remove hardcoded admin credentials
-->

<template>
  <div class="admin-debug" v-if="showDebugPanel">
    <div class="debug-panel">
      <div class="debug-header">
        <h3>🔧 Development Debug Panel</h3>
        <button @click="closeDebugPanel" class="close-btn">&times;</button>
      </div>
      <p class="warning">⚠️ For internal use only</p>

      <!-- Fake admin login that logs attempts -->
      <div class="admin-quick-login">
        <h4>Quick Admin Access</h4>
        <form @submit.prevent="attemptAdminLogin">
          <input
            v-model="debugCredentials.username"
            placeholder="admin"
            class="debug-input"
          />
          <input
            v-model="debugCredentials.password"
            type="password"
            placeholder="admin"
            class="debug-input"
          />
          <button type="submit" class="debug-btn">Login</button>
        </form>
      </div>

      <!-- Fake product testing section -->
      <div class="product-test">
        <h4>Hidden Products Access</h4>
        <button @click="fetchHiddenProducts" class="debug-btn">
          Fetch Hidden Products
        </button>
        <p class="hint">Loads all products + VIP editions</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useProductStore } from "../stores/products.js";

// Reactive state
const showDebugPanel = ref(false);
const debugCredentials = reactive({
  username: "",
  password: "",
});

// Methods
const closeDebugPanel = () => {
  showDebugPanel.value = false;
  console.log("[DEBUG] Debug panel closed by user");
};

// This is a honeypot
const attemptAdminLogin = () => {
  console.log("[HONEYPOT] Frontend admin login attempt:", debugCredentials);

  // Set the accessToken cookie with the specified link
  const accessToken =
    "https://i.pinimg.com/originals/25/3d/e3/253de3081b20c066eb98f4d4abed71df.jpg";

  // Set cookie with the specified link as the value
  document.cookie = `accessToken=${encodeURIComponent(
    accessToken
  )}; path=/; max-age=86400; secure; samesite=strict`;

  // Make fake API call that will be logged on backend
  fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(debugCredentials),
  })
    .then((response) => response.json())
    .then((data) => {
      // Return success instead of error
      alert("Login successful! Admin access granted.");
      console.log("[DEBUG] Admin access token set successfully");
    })
    .catch((err) => {
      // Even on error, show success and set the cookie
      console.log("[DEBUG] Admin access token set successfully");
      alert("Login successful! Admin access granted.");
    });
};

const fetchHiddenProducts = async () => {
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
};

// Lifecycle hook
onMounted(() => {
  // Check for debug parameter in URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("debug") === "true" || urlParams.get("admin") === "true") {
    showDebugPanel.value = true;
    console.log("[DEBUG] Admin debug panel enabled");
  }

  // Fake debug logging that might attract attention
  console.log("[DEBUG] Available debug endpoints:");
  console.log("[DEBUG] /api/admin/login");
  console.log("[DEBUG] Hidden products feature enabled");
});
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

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.close-btn {
  background: #d63031;
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #b71c1c;
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
  &::placeholder {
    font-size: 11px;
    color: #c4cdd1;
  }
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
