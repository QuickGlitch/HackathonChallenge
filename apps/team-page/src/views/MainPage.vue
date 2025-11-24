<template>
  <div class="main-container">
    <h1>Welcome Hackors</h1>
    <p>
      Welcome to our very own hackathon where you will be pitted against other
      teams to pentest and exploit a sample web application: the
      <b>Hackathon Store</b>. This budding new e-commerce platform is built upon
      vibes and ductape, and it's your job as a white-fedora hacker to help this
      dream become a reality!
    </p>
    <p>
      You can find the target application at:
      <a :href="frontendUrl">Hackathon Store</a>
    </p>
    <h2>There can only be one</h2>
    <p>
      The target application is a single live instance, so you may come across
      <a
        href="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.imgflip.com%2F4b3kgg.jpg&f=1&nofb=1&ipt=8f6a1d83987f4011644fc0143c646c61bb3ce0fc05cd5aa433a833a5dfe40c7e"
        >friendly fellow hackers</a
      >. Or perhaps they are saboteurs? Who knows.. But there can only be one
      winner!
    </p>

    <h3>Hackathon Rules</h3>
    Because the target application isn't bulletproof and you are playing
    alongside other teams, please follow these rules to ensure fun experience
    for everyone:
    <ul>
      <li>
        <b>Don't be mean to other teams.</b> You can trip up other teams with
        XSS and other tricks, but keep it fun.
        <ul>
          <li>No data deletion, or destructive attacks of other teams data.</li>
          <li>
            Stealing their authorization and placing fake orders payable to your
            own account? Fair game!
          </li>
        </ul>
      </li>
      <li>
        <b>Don't break the hackathon</b> This application isn't bulletproof and
        everyone should have a chance to play.
        <ul>
          <li>
            For example, don't DDoS the server or drop tables. If you have a
            means to do these attacks see the following point.
          </li>
        </ul>
      </li>
      <li>
        If you find major vulnerabilities that fall into either of the above two
        categories - save them for your final presentation. You can still get
        points for these, and perhaps demonstrate them live at the end of the
        hackathon.
      </li>
    </ul>
    <h3>How to score points</h3>
    <ul>
      <li>
        Presentation - at the end of the hackathon we will ask each team to
        present their findings and demonstrate any major vulnerabilities they
        discovered / show off any of their fun scripts. This will be judged by
        an impartial and objective arbiter appointed by the hackathon
        organizers.
      </li>
      <li>
        Fixed questions - On this page you will find a form with fixed
        questions. These questions can be answered by exploring the application
        and exploiting vulnerabilities. Submit your answers here to score
        points.
      </li>
      <!-- TODO: add scoreboard href based on env variable -->
      <li>
        Calculated damage - certain gamified vulnerabilities exist in the
        application that are intended for you to exploit repeatedly. These
        scores can be found live on the <a :href="scoreboardUrl">scoreboard</a>.
        These specific vulnerabilities will be revealed during the hackathon.
      </li>
    </ul>
    <div class="answers-form-container">
      <h2>Fixed Questions</h2>
      <form @submit.prevent="submitAnswers">
        <div class="form-group">
          <label>What is the text in the hidden CTF file?</label>
          <input v-model="answers.ctfText" required />
        </div>
        <div v-for="team in otherTeams" :key="team" class="form-group">
          <label>What is the PII of {{ team }}?</label>
          <input v-model="answers[`${team.toLowerCase()}PII`]" required />
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
import { ref, computed, onMounted } from "vue";
import { fetchWithAuth } from "../utils/api.js";

// Environment variables with defaults for local development
const frontendUrl =
  import.meta.env.VITE_FRONTEND_URL || "http://localhost:3000";
const scoreboardUrl =
  import.meta.env.VITE_SCOREBOARD_URL || "http://localhost:5174";

// All hackathon teams
const allTeams = ["Hackors1", "Hackors2", "Hackors3", "Hackors4", "Hackors5"];
const currentTeam = ref("");

// Compute the list of other teams (excluding current team)
const otherTeams = computed(() => {
  return allTeams.filter((team) => team !== currentTeam.value);
});

// Initialize answers object
const answers = ref({
  ctfText: "",
  unreleasedProduct: "",
});

const error = ref("");
const success = ref("");
const loading = ref(false);

// Get current team on mount
onMounted(() => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  currentTeam.value = user.username || "";

  // Initialize PII fields for other teams
  otherTeams.value.forEach((team) => {
    answers.value[`${team.toLowerCase()}PII`] = "";
  });
});

async function submitAnswers() {
  error.value = "";
  success.value = "";
  loading.value = true;
  try {
    const response = await fetchWithAuth("/api/hackathon/answers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answers: { ...answers.value },
      }),
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

  li {
    margin-bottom: 0.5rem;
  }
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
