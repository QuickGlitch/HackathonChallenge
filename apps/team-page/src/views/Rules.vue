<template>
  <div class="rules-container">
    <h2>Hackathon Rules</h2>
    <ul>
      <li>Each team must submit answers using this page.</li>
      <li>Do not share credentials with other teams.</li>
      <li>Answers must be submitted before the deadline.</li>
      <li>Each question is worth points towards your final score.</li>
      <li>Respect other teams and do not attempt to disrupt their progress.</li>
      <li>All answers are confidential until the end of the hackathon.</li>
    </ul>
    <button @click="goToAnswers">Submit Answers</button>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();
function goToAnswers() {
  router.push("/answers");
}
</script>

<style scoped>
.rules-container {
  max-width: 600px;
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
button {
  margin-top: 2rem;
  padding: 0.7rem 2rem;
  background: #2d7ef7;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}
</style>
