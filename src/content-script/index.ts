import manifest from "../../manifest.json"
import defaultSettings from "../defaultSettings.json"
import router from "./router"

const myConsole = window.console

function log(...data: any[]) {
  console.log(`%c${manifest.name}:`, "color: green; font-weight: bold", ...data)
}

async function loadSettings() {
  const settings = (await browser.storage.local.get("settings")).settings as
    | Settings
    | undefined
  window.settings = { ...defaultSettings, ...settings }
}

async function main() {
  window.console = myConsole // return hijacked console
  window.log = log // convenience

  await loadSettings()
  router()
}

window.addEventListener("DOMContentLoaded", main)
