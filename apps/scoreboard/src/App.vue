<template>
  <div class="container">
    <div class="header">
      <h1>🏆 Hackathon Scoreboard</h1>
      <p>Live team scores to get the people going</p>
    </div>

    <div class="scoreboard-card">
      <div v-if="loading" class="loading">Loading scores...</div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <div v-else>
        <div class="quote-section">
          <blockquote class="inspirational-quote">
            "{{ currentQuote }}"
            <cite>— Sun Tzu, The Art of War</cite>
          </blockquote>
        </div>

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
import sunTzu from "sun-tzu-quotes";
import ScoreChart from "./components/ScoreChart.vue";

const scores = ref([]);
const loading = ref(true);
const error = ref(null);
const lastUpdated = ref(new Date());
const currentQuote = ref("");
let intervalId = null;
let hasInitialLoad = ref(false);

const API_BASE_URL = "http://localhost:3001";

const getNewQuote = () => {
  currentQuote.value = sunTzu();
};

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

    // Get a new inspirational quote every time scores are fetched
    getNewQuote();
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
  // Initialize with a quote
  getNewQuote();
  startPolling();
});

onUnmounted(() => {
  stopPolling();
});
</script>

<style scoped>
.quote-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.inspirational-quote {
  margin: 0;
  color: white;
  font-style: italic;
  font-size: 1.1rem;
  line-height: 1.6;
  text-align: center;
  quotes: none;
}

.inspirational-quote cite {
  display: block;
  margin-top: 0.8rem;
  font-size: 0.9rem;
  font-style: normal;
  opacity: 0.9;
  font-weight: 500;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
  font-size: 2.5rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  background-clip: text;
  margin-bottom: 0.5rem;
}

.header p {
  margin: 0;
  color: #a8a8a8;
  font-size: 1.1rem;
}

.scoreboard-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  border: 1px solid #f0f0f0;
}

.loading,
.error {
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
}

.loading {
  color: #667eea;
}

.error {
  color: #e74c3c;
  background: #fdf2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

.refresh-info {
  text-align: center;
  color: #888;
  font-size: 0.9rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}
</style>
