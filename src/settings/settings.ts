import { fetchIgnoredUsers, loadSettings } from "../utils"

interface SettingsForm extends HTMLFormElement {
  filteredStrings: HTMLTextAreaElement
  ignoredUsers: HTMLTextAreaElement
  trackIgnoredUsers: HTMLInputElement
  submitButton: HTMLButtonElement
}

async function onSubmit(e: SubmitEvent) {
  e.preventDefault()

  const form = e.currentTarget as SettingsForm
  form.submitButton.disabled = true

  const filteredStrings = form.filteredStrings.value
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => line.toLowerCase().trim())

  const ignoredUsers = form.ignoredUsers.value
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => line.trim())

  const updatedSettings: Settings = {
    filteredStrings,
    ignoredUsers,
    trackIgnoredUsers: form.trackIgnoredUsers.checked,
  }

  // set settings
  await browser.storage.local.set({ settings: updatedSettings })
  await loadSettings()
}

async function setIgnoredUsers() {
  const ignoredUsers = await fetchIgnoredUsers()

  form.ignoredUsers.value = ignoredUsers.join("\n")
}

// events
const form = document.querySelector("form")
const loadIgnoredusers =
  document.querySelector<HTMLSpanElement>("#loadIgnoredusers")

form.addEventListener("submit", onSubmit)
loadIgnoredusers.addEventListener("click", setIgnoredUsers)

// set values from settings
loadSettings().then(() => {
  form.filteredStrings.value = settings.filteredStrings.join("\n")
  form.ignoredUsers.value = settings.ignoredUsers.join("\n")
  form.trackIgnoredUsers.checked = settings.trackIgnoredUsers
  form.submitButton.disabled = true

  // detect changes and enable button
  form.addEventListener("input", () => {
    const somethingChanged =
      form.filteredStrings.value != settings.filteredStrings.join("\n") ||
      form.ignoredUsers.value != settings.ignoredUsers.join("\n") ||
      form.trackIgnoredUsers.checked != settings.trackIgnoredUsers

    form.submitButton.disabled = !somethingChanged
  })
})
