import { createRouter, createWebHistory } from "vue-router";
import { fetchWithAuth } from "../utils/api.js";

import Login from "../views/Login.vue";
import MainPage from "../views/MainPage.vue";

const routes = [
  { path: "/", component: MainPage },
  { path: "/login", component: Login },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for accessToken
router.beforeEach(async (to, from, next) => {
  if (to.path === "/") {
    try {
      const response = await fetchWithAuth("/api/users/me", {
        method: "GET",
      });
      const validSession = response.status === 200;
      if (!validSession) {
        next("/login");
      } else {
        next();
      }
    } catch (error) {
      // If fetch fails, redirect to login
      next("/login");
    }
  } else {
    next();
  }
});

export default router;
