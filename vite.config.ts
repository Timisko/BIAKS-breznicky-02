import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { app } from "./server/server.ts";

export default defineConfig({
  plugins: [
    vue(),
    {
      name: "express-api",
      configureServer(server) {
        server.middlewares.use(app);
      },
    },
  ],
});
