import { loadSettings } from "../utils"

interface SettingsForm extends HTMLFormElement {
  filteredStrings: HTMLTextAreaElement
}

function onSubmit(e: SubmitEvent) {
  e.preventDefault()

  const form = e.currentTarget as SettingsForm

  const filteredStrings = form.filteredStrings.value.trim().split("\n")

  const updatedSettings = {
    filteredStrings,
  }

  // set settings
  browser.storage.local.set({ settings: updatedSettings })
}

const form = document.querySelector("form")

form.addEventListener("submit", onSubmit)

// set values from settings
loadSettings().then(() => {
  form.filteredStrings.value = settings.filteredStrings.join("\n")
})
