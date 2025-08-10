import { resolve } from "path"
import { defineConfig } from "vite"

// build for content script (iife)

export default defineConfig({
  root: "src",
  base: "./",
  build: {
    outDir: resolve(__dirname, "dist/content-script"),
    minify: !process.env.WATCH, // minify only on build
    rollupOptions: {
      input: resolve(__dirname, "src/content-script/index.ts"),
      output: {
        format: "iife",
        entryFileNames: "[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
    emptyOutDir: true,
  },
})
