<template>
  <div class="container">
    <div class="register-form">
      <h1>Create Account</h1>
      <p class="subtitle">Join Hackathon Store today</p>

      <form @submit.prevent="handleRegister" class="form">
        <div class="form-group">
          <label for="username" class="label">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="input"
            :class="{ 'input-error': errors.username }"
            placeholder="Enter your username"
            required
          />
          <span v-if="errors.username" class="error-text">{{
            errors.username
          }}</span>
        </div>

        <div class="form-group">
          <label for="name" class="label">Full Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="input"
            :class="{ 'input-error': errors.name }"
            placeholder="Enter your full name"
          />
          <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="label">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="input"
            :class="{ 'input-error': errors.password }"
            placeholder="Enter your password"
            required
          />
          <span v-if="errors.password" class="error-text">{{
            errors.password
          }}</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="label">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            class="input"
            :class="{ 'input-error': errors.confirmPassword }"
            placeholder="Confirm your password"
            required
          />
          <span v-if="errors.confirmPassword" class="error-text">{{
            errors.confirmPassword
          }}</span>
        </div>

        <div class="form-group">
          <label for="role" class="label">Account Type</label>
          <select
            id="role"
            v-model="form.role"
            class="input"
            :class="{ 'input-error': errors.role }"
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
          <span v-if="errors.role" class="error-text">{{ errors.role }}</span>
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isLoading"
          :class="{ 'btn-loading': isLoading }"
        >
          <span v-if="isLoading">Creating Account...</span>
          <span v-else>Create Account</span>
        </button>

        <div v-if="generalError" class="error-message">
          {{ generalError }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </form>

      <div class="form-footer">
        <p>
          Already have an account?
          <router-link to="/login" class="link">Sign in here</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Form data
const form = reactive({
  username: "",
  name: "",
  password: "",
  confirmPassword: "",
  role: "customer",
});

// Form state
const isLoading = ref(false);
const generalError = ref("");
const successMessage = ref("");
const errors = reactive({
  username: "",
  name: "",
  password: "",
  confirmPassword: "",
  role: "",
});

// Clear errors when user types
const clearErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = "";
  });
  generalError.value = "";
};

// Validate form
const validateForm = () => {
  clearErrors();
  let isValid = true;

  // Username validation
  if (!form.username.trim()) {
    errors.username = "Username is required";
    isValid = false;
  } else if (form.username.length < 3) {
    errors.username = "Username must be at least 3 characters";
    isValid = false;
  }

  // Password validation
  if (!form.password) {
    errors.password = "Password is required";
    isValid = false;
  } else if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
    isValid = false;
  }

  // Confirm password validation
  if (!form.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
    isValid = false;
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
    isValid = false;
  }

  return isValid;
};

// Handle registration
const handleRegister = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  generalError.value = "";
  successMessage.value = "";

  try {
    const response = await fetch("http://localhost:3001/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies
      body: JSON.stringify({
        username: form.username,
        name: form.name || undefined,
        password: form.password,
        role: form.role,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      successMessage.value =
        "Account created successfully! Redirecting to login...";

      // Reset form
      Object.keys(form).forEach((key) => {
        form[key] = key === "role" ? "customer" : "";
      });

      // Redirect to login page after success
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      generalError.value = data.error || "Registration failed";
    }
  } catch (error) {
    console.error("Registration error:", error);
    generalError.value = "Network error. Please try again.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.container {
  max-width: 500px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.register-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.register-form h1 {
  text-align: center;
  margin-bottom: 0.5rem;
  color: #333;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.label {
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.input {
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #667eea;
}

.input-error {
  border-color: #ef4444;
}

.error-text {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
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
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-loading {
  position: relative;
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

.form-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e1e5e9;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}
</style>
