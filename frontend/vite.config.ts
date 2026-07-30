import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/proofdesk-stellar-soroban-bootcamp/" : "/",
  plugins: [react()],
  server: {
    port: 4325,
  },
  build: {
    chunkSizeWarningLimit: 2200,
  },
});
