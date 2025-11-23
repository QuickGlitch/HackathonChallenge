<template>
  <div class="container">
    <div class="header">
      <h1>🏆 Hackathon Scoreboard</h1>
      <p>Live team scores to get the people going</p>
    </div>

    <!-- Fishing GIF Overlay -->
    <div v-if="showBotActivity" class="gif-overlay" @click="hideGif">
      <div class="gif-container">
        <img :src="currentGif" alt="Fishing GIF" class="fishing-gif" />
        <div class="gif-close">Click to close or wait...</div>
      </div>
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

    <!-- Fishing GIF Overlay -->
    <div v-if="showBotActivity" class="gif-overlay" @click="hideGif">
      <div class="gif-container">
        <img :src="currentGif" alt="Fishing GIF" class="fishing-gif" />
        <p class="gif-caption">🎣</p>
      </div>
    </div>

    <!-- News Ticker -->
    <div v-if="showBotActivity" class="news-ticker">
      <div class="news-content">
        <span class="breaking-label">BREAKING NEWS:</span>
        <span class="news-text"
          >It's fishing season - boomer bots are clicking links</span
        >
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
const showBotActivity = ref(false);
const currentGif = ref("");
let intervalId = null;
let eventSource = null;
let hasInitialLoad = ref(false);

const API_BASE_URL = "http://localhost:3001";
const GIPHY_API_KEY = "GlVGYHkr3WSBnllca54iNt0yFbjz7L65"; // Public demo key

const getNewQuote = () => {
  currentQuote.value = sunTzu();
};

const fetchRandomFishingGif = async () => {
  try {
    const response = await axios.get(`https://api.giphy.com/v1/gifs/search`, {
      params: {
        api_key: GIPHY_API_KEY,
        q: "fishing",
        limit: 50,
        rating: "g",
        lang: "en",
      },
    });

    if (response.data.data && response.data.data.length > 0) {
      const randomIndex = Math.floor(Math.random() * response.data.data.length);
      const gif = response.data.data[randomIndex];
      currentGif.value = gif.images.original.url;
      showBotActivity.value = true;
    }
  } catch (err) {
    console.error("Failed to fetch fishing GIF:", err);
  }
};

const hideGif = () => {
  showBotActivity.value = false;
};

const setupBotActivityStream = () => {
  console.log("Connecting to bot activity stream...");

  eventSource = new EventSource(`${API_BASE_URL}/api/bot-activity/stream`);

  eventSource.onopen = () => {
    console.log("Connected to bot activity stream");
  };

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Bot activity update:", data);

      if (data.isActive && !showBotActivity.value) {
        // Bot just started - fetch a fishing GIF and show it
        fetchRandomFishingGif();
      } else if (!data.isActive && showBotActivity.value) {
        // Bot stopped - hide the GIF after a brief delay for a better UX
        setTimeout(() => (showBotActivity.value = false), 10000);
      }
    } catch (error) {
      console.error("Error parsing bot activity data:", error);
    }
  };

  eventSource.onerror = (error) => {
    console.error("SSE connection error:", error);
    // Attempt to reconnect after 5 seconds
    setTimeout(() => {
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log("Attempting to reconnect...");
        setupBotActivityStream();
      }
    }, 5000);
  };
};

const closeEventSource = () => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
    console.log("Closed bot activity stream");
  }
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
  getNewQuote();
  startPolling();
  setupBotActivityStream();
});

onUnmounted(() => {
  stopPolling();
  closeEventSource();
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

.gif-overlay {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  cursor: pointer;
  animation: slideInCorner 0.3s ease-out;
}

.gif-container {
  background: white;
  border-radius: 15px;
  padding: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  max-width: 300px;
  max-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 3px solid #667eea;
}

.fishing-gif {
  max-width: 280px;
  max-height: 160px;
  border-radius: 10px;
  object-fit: cover;
}

.gif-close {
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.8rem;
  text-align: center;
  opacity: 0.8;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInCorner {
  from {
    transform: translateX(100%) scale(0.8);
    opacity: 0;
  }
  to {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: scale(0.8) translateY(-20px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.news-ticker {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(90deg, #c41e3a 0%, #e53e3e 100%);
  color: white;
  overflow: hidden;
  z-index: 999;
  border-top: 2px solid #fff;
  animation: slideUp 0.3s ease-out;
}

.news-content {
  display: flex;
  align-items: center;
  height: 100%;
  white-space: nowrap;
  animation: scroll 15s linear infinite;
  padding-left: 100%;
}

.breaking-label {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.8rem;
  margin-right: 1rem;
  font-weight: bold;
  font-size: 0.9rem;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.news-text {
  font-size: 1rem;
  font-weight: 500;
}

@keyframes scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
