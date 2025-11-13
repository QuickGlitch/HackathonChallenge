<template>
  <div class="score-chart">
    <h2 class="chart-title">Team Scores</h2>
    <div class="chart-container">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const props = defineProps({
  scores: {
    type: Array,
    default: () => [],
  },
});

// Color palette for bars
const CHART_COLORS = [
  "rgba(255, 99, 132, 0.8)",
  "rgba(54, 162, 235, 0.8)",
  "rgba(255, 206, 86, 0.8)",
  "rgba(75, 192, 192, 0.8)",
  "rgba(153, 102, 255, 0.8)",
  "rgba(255, 159, 64, 0.8)",
];

// Reactive chart data
const chartData = computed(() => {
  if (!props.scores?.length) {
    return {
      labels: [],
      datasets: [
        {
          label: "Score",
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 2,
        },
      ],
    };
  }

  const labels = props.scores.map((team) => team.teamName);
  const data = props.scores.map((team) => team.score);
  const backgroundColor = CHART_COLORS.slice(0, data.length);
  const borderColor = backgroundColor.map((color) => color.replace("0.8", "1"));

  return {
    labels,
    datasets: [
      {
        label: "Score",
        data,
        backgroundColor,
        borderColor,
        borderWidth: 2,
      },
    ],
  };
});

// Chart configuration
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 300,
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => `Score: ${context.parsed.y.toFixed(2)} points`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(0, 0, 0, 0.1)",
      },
      ticks: {
        callback: (value) => Math.round(value),
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
};
</script>

<style scoped>
.score-chart {
  width: 100%;
}

.chart-title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.5rem;
  color: #333;
  font-weight: 600;
}

.chart-container {
  position: relative;
  height: 400px;
  margin: 20px 0;
}
</style>
