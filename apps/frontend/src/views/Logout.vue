<template>
  <div class="container">
    <div class="logout-form">
      <h1>Confirm Logout</h1>
      <p class="subtitle">Are you sure you want to sign out?</p>

      <div v-if="isLoading" class="loading-message">Signing out...</div>

      <div v-else class="logout-actions">
        <button
          @click="handleLogout"
          class="btn btn-primary"
          :disabled="isLoading"
        >
          Yes, Sign Out
        </button>

        <router-link to="/" class="btn btn-secondary"> Cancel </router-link>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);
const successMessage = ref("");
const error = ref("");

const handleLogout = async () => {
  isLoading.value = true;
  error.value = "";
  successMessage.value = "";

  try {
    const result = await authStore.logout();

    if (result.success) {
      successMessage.value = "Successfully signed out. Redirecting to home...";

      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } else {
      error.value = result.error || "Logout failed";
    }
  } catch (err) {
    console.error("Logout error:", err);
    error.value = "An error occurred while signing out";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.logout-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.logout-form h1 {
  margin-bottom: 0.5rem;
  color: #333;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.loading-message {
  padding: 1rem;
  color: #60a5fa;
  font-size: 1.1rem;
  font-weight: 500;
}

.logout-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  text-align: center;
  display: inline-block;
  min-width: 120px;
}

.btn-primary {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #fef2f2;
  color: #ef4444;
  padding: 0.75rem;
  border-radius: 4px;
  border-left: 4px solid #ef4444;
  margin-top: 1rem;
}

.success-message {
  background: #f0fdf4;
  color: #16a34a;
  padding: 0.75rem;
  border-radius: 4px;
  border-left: 4px solid #16a34a;
  margin-top: 1rem;
}
</style>
