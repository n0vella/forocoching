import { loadSettings } from "../shared/storage"
import { initContext } from "./context"
import "./index.css"
import router from "./router"

// Capture native console before site scripts can override it
const originalConsole = window.console

async function main() {
  window.console = originalConsole
  const settings = await loadSettings()
  initContext(settings)
  router()
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", main, { once: true })
} else {
  main()
}
