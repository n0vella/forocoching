import { resolve } from "path"
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  root: "src",
  base: "./",
  plugins: [tailwindcss()],
  build: {
    outDir: resolve(__dirname, "dist"),
    minify: !process.env.WATCH, // minify only on build
    rollupOptions: {
      input: {
        "settings/settings": resolve(__dirname, "src/settings/settings.html"),
        background: resolve(__dirname, "src/background/background.ts")
      },
      output: {
        format: "es",
        entryFileNames: "[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
    emptyOutDir: true
  },
})
