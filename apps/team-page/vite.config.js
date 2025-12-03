import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "/team-page/",
  plugins: [vue()],
  server: {
    port: 5175,
    host: true,
    proxy: {},
  },
});
