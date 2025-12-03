<template>
  <div class="container">
    <div class="login-form">
      <h1>Welcome Back</h1>
      <p class="subtitle">
Sign in to your account
</p>

      <form
class="form"
@submit.prevent="handleLogin"
>
        <div class="form-group">
          <label
for="username"
class="label"
>Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="input"
            :class="{ 'input-error': errors.username }"
            placeholder="Enter your username"
            required
          >
          <span
v-if="errors.username"
class="error-text"
>{{
            errors.username
          }}</span>
        </div>

        <div class="form-group">
          <label
for="password"
class="label"
>Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="input"
            :class="{ 'input-error': errors.password }"
            placeholder="Enter your password"
            required
          >
          <span
v-if="errors.password"
class="error-text"
>{{
            errors.password
          }}</span>
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isLoading"
          :class="{ 'btn-loading': isLoading }"
        >
          <span v-if="isLoading">Signing In...</span>
          <span v-else>Sign In</span>
        </button>

        <div
v-if="generalError"
class="error-message"
>
          {{ generalError }}
        </div>

        <div
v-if="successMessage"
class="success-message"
>
          {{ successMessage }}
        </div>
      </form>

      <div class="form-footer">
        <p>
          Don't have an account?
          <router-link
to="/register"
class="link"
>
            Create one here
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// Form data
const form = reactive({
  username: '',
  password: '',
});

// Form state
const isLoading = ref(false);
const generalError = ref('');
const successMessage = ref('');
const errors = reactive({
  username: '',
  password: '',
});

// Clear errors when user types
const clearErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = '';
  });
  generalError.value = '';
};

// Validate form
const validateForm = () => {
  clearErrors();
  let isValid = true;

  // Username validation
  if (!form.username.trim()) {
    errors.username = 'Username is required';
    isValid = false;
  }

  // Password validation
  if (!form.password) {
    errors.password = 'Password is required';
    isValid = false;
  }

  return isValid;
};

// Handle login
const handleLogin = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  generalError.value = '';
  successMessage.value = '';

  const result = await authStore.login({
    username: form.username,
    password: form.password,
  });

  if (result.success) {
    successMessage.value = 'Login successful! Redirecting...';

    // Reset form
    form.username = '';
    form.password = '';

    // Redirect to home page after success
    setTimeout(() => {
      router.push('/');
    }, 1500);
  } else {
    generalError.value = result.error;
  }

  isLoading.value = false;
};
</script>

<style scoped>
.container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-form h1 {
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
  border-color: #60a5fa;
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
  background: linear-gradient(135deg, #1e3a8a 0%, #60a5fa 100%);
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
  color: #60a5fa;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}
</style>
