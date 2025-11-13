<template>
  <div class="container">
    <div class="header">
      <h1>🏆 Hackathon Scoreboard</h1>
      <p>Live team scores updated every 30 seconds</p>
    </div>

    <div class="scoreboard-card">
      <div v-if="loading" class="loading">Loading scores...</div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <div v-else>
        <ScoreChart :scores="scores" />

        <div class="refresh-info">
          Last updated: {{ lastUpdated.toLocaleString() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import axios from "axios";
import ScoreChart from "./components/ScoreChart.vue";

const scores = ref([]);
const loading = ref(true);
const error = ref(null);
const lastUpdated = ref(new Date());
let intervalId = null;
let hasInitialLoad = ref(false);

const API_BASE_URL = "http://localhost:3001";

const fetchScores = async () => {
  let loadingTimeout = null;

  try {
    // Only show loading immediately on first load
    if (!hasInitialLoad.value) {
      loading.value = true;
    } else {
      // For subsequent loads, only show loading if request takes > 3 seconds
      loadingTimeout = setTimeout(() => {
        loading.value = true;
      }, 3000);
    }

    error.value = null;

    const response = await axios.get(`${API_BASE_URL}/api/scores`);
    scores.value = response.data;
    lastUpdated.value = new Date();
    hasInitialLoad.value = true;
  } catch (err) {
    console.error("Failed to fetch scores:", err);
    error.value =
      "Failed to fetch scores. Please check if the backend is running.";
  } finally {
    // Clear the loading timeout if it exists
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
    loading.value = false;
  }
};

const startPolling = () => {
  // Fetch immediately
  fetchScores();

  // Then fetch every 30 seconds
  intervalId = setInterval(fetchScores, 10000);
};

const stopPolling = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

onMounted(() => {
  startPolling();
});

onUnmounted(() => {
  stopPolling();
});
</script>
