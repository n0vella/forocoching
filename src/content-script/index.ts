import manifest from "../../manifest.json"

const myConsole = window.console

function log(...data: any[]) {
  console.log(`%c${manifest.name}:`, "color: green; font-weight: bold", ...data)
}

function main() {
  window.console = myConsole // return hijacked console
  window.log = log // convenience

  log("Hello world!")
}

window.addEventListener("DOMContentLoaded", main)
