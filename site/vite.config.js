import { defineConfig } from "vite"
import { sveltekit } from "@sveltejs/kit/vite"
import { resolve } from "node:path"

const couriers = resolve(import.meta.dirname, "../couriers")

export default defineConfig({
  plugins: [sveltekit()],
  server: { fs: { allow: [".", couriers] } },
  test: {
    setupFiles: ["./test/setup.js"],
    include: ["test/**/*.test.js"],
  },
})
