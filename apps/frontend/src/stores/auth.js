import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { apiFetch } from "@/utils/api";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const initialized = ref(false);

  const isLoggedIn = computed(() => {
    return user.value !== null;
  });

  // Check authentication status by calling the backend
  async function checkAuthStatus() {
    try {
      const response = await apiFetch("/api/users/me", {
        method: "GET",
      });

      if (response.ok) {
        // const userData = await response.json();
        // user.value = userData;
        // localStorage.setItem("user", JSON.stringify(userData));
        return true;
      } else {
        // Not authenticated
        user.value = null;
        localStorage.removeItem("user");
        return false;
      }
    } catch (err) {
      // Network error or server down - assume not authenticated
      user.value = null;
      localStorage.removeItem("user");
      return false;
    }
  }

  // Get current user info from stored data
  function getCurrentUser() {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error("Error parsing stored user data:", e);
        localStorage.removeItem("user");
      }
    }
    return null;
  }

  // Initialize user by checking authentication status
  async function initAuth() {
    if (initialized.value) return;

    isLoading.value = true;

    // First check if we have stored user data
    const storedUser = getCurrentUser();
    if (storedUser) {
      user.value = storedUser;
    }

    // Then verify with backend (this will update user.value if token is valid)
    await checkAuthStatus();

    initialized.value = true;
    isLoading.value = false;
  }

  // Ensure auth is initialized before accessing auth state
  async function ensureInitialized() {
    if (!initialized.value) {
      await initAuth();
    }
  }

  // Login function
  async function login(credentials) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiFetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        user.value = data.user;
        localStorage.setItem("user", JSON.stringify(data.user));
        initialized.value = true; // Mark as initialized after successful login
        return { success: true, data };
      } else {
        error.value = data.error || "Login failed";
        return { success: false, error: error.value };
      }
    } catch (err) {
      error.value = "Network error. Please try again.";
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  // Logout function
  async function logout() {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiFetch("/api/users/logout", {
        method: "POST",
      });

      // Always clear client state regardless of server response
      user.value = null;
      localStorage.removeItem("user");
      initialized.value = true; // Keep initialized state

      return { success: true };
    } catch (err) {
      // Even if network error, clear client state
      user.value = null;
      localStorage.removeItem("user");
      return { success: true };
    } finally {
      isLoading.value = false;
    }
  }

  // Clear error
  function clearError() {
    error.value = null;
  }

  // Auto-initialize when store is created
  initAuth();

  return {
    user,
    isLoading,
    error,
    isLoggedIn,
    initialized,
    login,
    logout,
    clearError,
    initAuth,
    ensureInitialized,
    getCurrentUser,
    checkAuthStatus,
  };
});
