const myConsole = window.console

function main() {
  window.console = myConsole // return hijacked console
  window.log = console.log // convenience

  log("Hello world!")
}

window.addEventListener("DOMContentLoaded", main)
