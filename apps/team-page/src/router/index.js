import { createRouter, createWebHistory } from 'vue-router';
import { fetchWithAuth } from '../utils/api.js';

import Login from '../views/Login.vue';
import MainPage from '../views/MainPage.vue';

const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

const routes = [
  { path: '/', name: 'home', component: MainPage },
  { path: '/login', name: 'login', component: Login },
];

const router = createRouter({
  // Ensure routing works under the deployed subpath (/team-page/)
  history: createWebHistory(base),
  routes,
});

// Navigation guard for accessToken
router.beforeEach(async (to, from, next) => {
  if (to.path === '/') {
    try {
      const response = await fetchWithAuth('/api/users/me', {
        method: 'GET',
      });
      const validSession = response.status === 200;
      if (!validSession) {
        next(`${base}/login`);
      } else {
        next();
      }
    } catch (error) {
      // If fetch fails, redirect to login
      const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
      next(`${base}/login`);
    }
  } else {
    next();
  }
});

export default router;
