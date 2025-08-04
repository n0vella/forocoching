import { copyFileSync } from "fs"
import { resolve } from "path"
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  root: "src",
  base: "./",
  plugins: [
    {
      name: "copy-browser-polyfill",
      closeBundle() {
        const src = resolve(
          __dirname,
          "node_modules",
          "webextension-polyfill",
          "dist",
          "browser-polyfill.js",
        )
        const dest = resolve(__dirname, "dist", "browser-polyfill.js")
        copyFileSync(src, dest)
      },
    },
    tailwindcss(),
  ],
  build: {
    outDir: resolve(__dirname, "dist"),
    minify: !process.env.WATCH, // minify only on build
    rollupOptions: {
      input: {
        "content-script/index": resolve(
          __dirname,
          "src/content-script/index.ts",
        ),
        "settings/settings": resolve(__dirname, "src/settings/settings.html"),
        "background/background": resolve(
          __dirname,
          "src/background/background.ts",
        ),
      },
      output: {
        entryFileNames: "[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
    emptyOutDir: true,
  },
})
