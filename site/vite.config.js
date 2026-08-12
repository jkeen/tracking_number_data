import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import { resolve } from "node:path"

const couriers = resolve(import.meta.dirname, "../couriers")

export default defineConfig({
  base: process.env.SITE_BASE ?? "/",
  plugins: [svelte()],
  server: { fs: { allow: [".", couriers] } },
  build: { outDir: "dist", emptyOutDir: true },
  // Without this Vitest resolves Svelte's server build, where mount() does not exist.
  resolve: process.env.VITEST ? { conditions: ["browser"] } : undefined,
  test: { setupFiles: ["./test/setup.js"] },
})
