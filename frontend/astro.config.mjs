import { defineConfig } from "astro/config";

const repository = process.env.GITHUB_REPOSITORY || "";
const parts = repository.split("/");
const owner = parts[0] || "";
const repo = parts[1] || "";
const isActions = process.env.GITHUB_ACTIONS === "true";
const isUserSite = Boolean(owner && repo && repo.toLowerCase() === (owner.toLowerCase() + ".github.io"));

const site = owner ? "https://" + owner + ".github.io" : "https://telestas.github.io";
const base = isActions ? (isUserSite ? "/" : "/" + repo + "/") : "/";

export default defineConfig({
  output: "static",
  site,
  base,
  vite: {
    server: {
      fs: {
        allow: [".."],
      },
    },
  },
});
