import { createRouter, createWebHistory } from "vue-router";

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
    const validSession = await fetch("/api/users/me", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        return res.status === 200;
      })
      .catch(() => false);
    if (!validSession) {
      next("/login");
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
