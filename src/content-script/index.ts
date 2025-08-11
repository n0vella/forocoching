import manifest from "../../manifest.json"
import { loadSettings } from "../utils"
import router from "./router"

const myConsole = window.console

function log(...data: any[]) {
  console.log(`%c${manifest.name}:`, "color: green; font-weight: bold", ...data)
}

async function main() {
  window.console = myConsole // return hijacked console
  window.log = log // convenience

  await loadSettings()
  router()
}

window.addEventListener("DOMContentLoaded", main)
