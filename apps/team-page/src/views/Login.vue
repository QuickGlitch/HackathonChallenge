<template>
  <div class="login-container">
    <h2>Team Login</h2>
    <form @submit.prevent="handleLogin">
      <input
        v-model="username"
        placeholder="Username"
        required
        name="username"
      />
      <input
        v-model="password"
        name="password"
        type="password"
        placeholder="Password"
        required
      />
      <button type="submit" :disabled="loading">Login</button>
      <p v-if="error" class="error">
        {{ error }}
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// import axios from "axios";
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const router = useRouter();

async function handleLogin() {
  error.value = '';
  loading.value = true;
  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    localStorage.setItem('user', JSON.stringify(data.user));
    router.push('/');
  } catch (e) {
    error.value = e.message || 'Login failed';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  max-width: 350px;
  margin: 80px auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
}
input {
  width: 100%;
  display: block;
  margin-bottom: 1rem;
  padding: 0.7rem 0 0.7rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

input::placeholder {
  padding-left: 0.5rem;
}

button {
  width: 100%;
  padding: 0.7rem;
  background: #2d7ef7;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}
.error {
  color: #d00;
  margin-top: 0.5rem;
}
</style>
