import { resolve } from "path"
import { defineConfig } from "vite"

// Content scripts are built as a single self-contained IIFE for Chrome & Firefox MV3 compatibility
export default defineConfig({
  root: "src",
  base: "./",
  publicDir: false,
  build: {
    outDir: resolve(__dirname, "dist/base/content-script"),
    minify: !process.env.WATCH,
    sourcemap: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(__dirname, "src/content-script/index.ts"),
      output: {
        format: "iife",
        inlineDynamicImports: true,
        entryFileNames: "index.js",
        assetFileNames: "index[extname]",
      },
    },
    emptyOutDir: true,
  },
})
