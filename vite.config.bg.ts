import { resolve } from "path"
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  root: "src",
  base: "./",
  publicDir: false,
  plugins: [tailwindcss()],
  build: {
    outDir: resolve(__dirname, "dist/base"),
    minify: !process.env.WATCH,
    sourcemap: false,
    rollupOptions: {
      input: {
        "settings/settings": resolve(__dirname, "src/settings/settings.html"),
        background: resolve(__dirname, "src/background/index.ts"),
      },
      output: {
        format: "es",
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
    emptyOutDir: true,
  },
})
