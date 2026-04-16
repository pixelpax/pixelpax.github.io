import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  site: "https://gabrielelkind.com",
  base: basePath,
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});
