import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://alecog.github.io",
  base: process.env.GITHUB_ACTIONS === "true" ? "/kairos-lab" : "/",
});
