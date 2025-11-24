<template>
  <div class="main-container">
    <h2>Hackathon Rules</h2>
    <ul>
      <li>Each team must submit answers using this page.</li>
      <li>Do not share credentials with other teams.</li>
      <li>Answers must be submitted before the deadline.</li>
      <li>Each question is worth points towards your final score.</li>
      <li>Respect other teams and do not attempt to disrupt their progress.</li>
      <li>All answers are confidential until the end of the hackathon.</li>
    </ul>
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
  </div>
</template>

<script setup>
import { ref } from "vue";

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
        answers: { ...answers.value },
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
.main-container {
  max-width: 700px;
  margin: 40px auto;
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
}
ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}
.answers-form-container {
  margin-top: 2rem;
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
