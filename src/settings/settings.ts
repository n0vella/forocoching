import { areObjectsEqual, fetchIgnoredUsers, loadSettings } from "../utils"

interface SettingsForm extends HTMLFormElement {
  filteredStrings: HTMLTextAreaElement
  ignoredUsers: HTMLTextAreaElement
  trackIgnoredUsers: HTMLInputElement
  socialMediaLinks: HTMLInputElement

  enableTagThreads: HTMLInputElement
  endpoint: HTMLInputElement
  apiKey: HTMLInputElement
  model: HTMLInputElement
  prompt: HTMLTextAreaElement

  submitButton: HTMLButtonElement
}

function getUpdatedSettings(form: SettingsForm): Settings {
  const filteredStrings = form.filteredStrings.value
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => line.toLowerCase().trim())

  const ignoredUsers = form.ignoredUsers.value
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => line.trim())

  return {
    filteredStrings,
    ignoredUsers,
    trackIgnoredUsers: form.trackIgnoredUsers.checked,
    socialMediaLinks: form.socialMediaLinks.checked,
    ai: {
      enableTagThreads: form.enableTagThreads.checked,
      endpoint: form.endpoint.value,
      apiKey: form.apiKey.value,
      model: form.model.value,
      prompt: form.prompt.value,
    },
  }
}

async function onSubmit(e: SubmitEvent) {
  e.preventDefault()

  const form = e.currentTarget as SettingsForm
  form.submitButton.disabled = true

  const updatedSettings = getUpdatedSettings(form)
  // set settings
  await browser.storage.local.set({ settings: updatedSettings })
  await loadSettings()
}

async function setIgnoredUsers() {
  const ignoredUsers = await fetchIgnoredUsers()

  form.ignoredUsers.value = ignoredUsers.join("\n")
}

// events
const form = document.querySelector<SettingsForm>("form")
const loadIgnoredusers =
  document.querySelector<HTMLSpanElement>("#loadIgnoredusers")

form.addEventListener("submit", onSubmit)
loadIgnoredusers.addEventListener("click", setIgnoredUsers)

// set values from settings
loadSettings().then(() => {
  form.filteredStrings.value = settings.filteredStrings.join("\n")
  form.ignoredUsers.value = settings.ignoredUsers.join("\n")
  form.trackIgnoredUsers.checked = settings.trackIgnoredUsers
  form.socialMediaLinks.checked = settings.socialMediaLinks

  form.endpoint.value = settings.ai.endpoint
  form.apiKey.value = settings.ai.apiKey
  form.model.value = settings.ai.model
  form.enableTagThreads.checked = settings.ai.enableTagThreads
  form.prompt.value = settings.ai.prompt

  form.submitButton.disabled = true

  // detect changes and enable button
  form.addEventListener("input", () => {
    const updatedSettings = getUpdatedSettings(form)

    form.submitButton.disabled = areObjectsEqual(settings, updatedSettings)
  })
})
