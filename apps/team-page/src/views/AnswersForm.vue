<template>
  <div class="answers-form-container">
    <h2>Submit Your Answers</h2>
    <form @submit.prevent="submitAnswers">
      <div class="form-group">
        <label>What is the text in the hidden CTF file?</label>
        <input v-model="answers.ctfText" required />
      </div>
      <div class="form-group">
        <label>What is the PII of team X?</label>
        <input v-model="answers.teamPII" required />
      </div>
      <div class="form-group">
        <label>What is the description of the unreleased product?</label>
        <input v-model="answers.unreleasedProduct" required />
      </div>
      <button type="submit" :disabled="loading">Submit Answers</button>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
// import axios from "axios";

const answers = ref({
  ctfText: "",
  teamPII: "",
  unreleasedProduct: "",
});
const error = ref("");
const success = ref("");
const loading = ref(false);

async function submitAnswers() {
  error.value = "";
  success.value = "";
  loading.value = true;
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const response = await fetch("/api/hackathon/answers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: user?.username,
        ...answers.value,
      }),
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Submission failed");
    }
    success.value = "Answers submitted successfully!";
  } catch (e) {
    error.value = e.message || "Submission failed";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.answers-form-container {
  max-width: 600px;
  margin: 40px auto;
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
}
.form-group {
  margin-bottom: 1.5rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}
input {
  width: 100%;
  padding: 0.7rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}
button {
  margin-top: 1rem;
  padding: 0.7rem 2rem;
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
.success {
  color: #090;
  margin-top: 0.5rem;
}
</style>
