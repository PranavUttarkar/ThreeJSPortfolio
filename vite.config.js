import { defineConfig } from "vite";
import { resolve } from "path";

// Ensure all standalone HTML pages (projects & experiences) are treated as build entry points
export default defineConfig({
  server: {
    proxy: {
      // If running `vercel dev` on port 3000, forward /api calls there; adjust as needed.
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "about.html"),
        // Contact page
        contact: resolve(__dirname, "contact.html"),
        // Index pages for sections
        projects: resolve(__dirname, "projects/index.html"),
        experiences: resolve(__dirname, "experiences/index.html"),
        // Project pages
        projAggieAgenda: resolve(__dirname, "project/proj-aggie-agenda.html"),
        projToyotai: resolve(__dirname, "project/proj-toyotai.html"),
        projTamuProfsort: resolve(__dirname, "project/proj-tamu-profsort.html"),
        projPortfolio3d: resolve(__dirname, "project/proj-portfolio-3d.html"),
        projMindweb: resolve(__dirname, "project/proj-mindweb.html"),
        projImpossibleParkour: resolve(
          __dirname,
          "project/proj-impossible-parkour.html"
        ),
        projCarClinicAi: resolve(__dirname, "project/proj-car-clinic-ai.html"),
        projAmStudys: resolve(__dirname, "project/proj-am-studys.html"),
        // Experience pages
        expResearchSound: resolve(
          __dirname,
          "experience/exp-research-sound.html"
        ),
        expMindwebFounder: resolve(
          __dirname,
          "experience/exp-mindweb-founder.html"
        ),
        expDaikinAi: resolve(__dirname, "experience/exp-daikin-ai.html"),
      },
    },
  },
});
