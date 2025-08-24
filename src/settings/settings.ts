import { areObjectsEqual, fetchIgnoredUsers, loadSettings } from "../utils"
import defaultSettings from "../defaultSettings.json"

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

function updateSaveButtonState() {
  const updatedSettings = getUpdatedSettings(form)
  form.submitButton.disabled = areObjectsEqual(settings, updatedSettings)
}

function appendTagElement(tag: Tag) {
  const tagsDiv = document.querySelector<HTMLDivElement>("#tags")

  const tagContainer = document.createElement("div")
  const tagId = tagsDiv.childNodes.length + 1
  tagContainer.id = "tag-" + tagId
  tagContainer.classList.add("tag-container")

  tagContainer.innerHTML = `
    <input placeholder="tag" value="${tag.tagName}" class="user-input max-sm:w-full" />
    <input placeholder="descripción" value="${tag.description}" class="user-input w-xl max-w-full" />
    <input type="color" title="color" value="${tag.color}" class="rounded-lg cursor-pointer"/>
    <button type="button" class="settings-button h-8">
      <span class="mb-1 text-3xl">-</span>
    </button>
    `

  tagsDiv.appendChild(tagContainer)

  const removeButton = tagContainer.querySelector("button")

  removeButton.addEventListener("click", () => {
    tagsDiv.querySelector("#tag-" + tagId).remove()
    updateSaveButtonState()
  })
}

function loadTags() {
  for (const tag of settings.ai.tags) {
    appendTagElement(tag)
  }
}

function addTag() {
  appendTagElement({
    tagName: "",
    description: "",
    color: "",
  })
}

function setDefaultPrompt() {
  console.log(defaultSettings)
  form.prompt.value = defaultSettings.ai.prompt
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

  const tags = Array.from(
    document.querySelectorAll<HTMLDivElement>('#tags > div[id^="tag-"]'),
  )
    .map((tag) => {
      const [tagName, description, color] = Array.from(
        tag.querySelectorAll<HTMLInputElement>("input"),
      )

      return {
        tagName: tagName.value.trim(),
        description: description.value.trim(),
        color: color.value,
      }
    })
    .filter((tag) => tag.tagName && tag.description)

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
      tags,
    },
  }
}

async function onSubmit(e: SubmitEvent) {
  e.preventDefault()

  const form = e.currentTarget as SettingsForm
  form.submitButton.disabled = true

  const updatedSettings = getUpdatedSettings(form)
  // set settings
  await chrome.storage.local.set({ settings: updatedSettings })
  await loadSettings()
}

async function setIgnoredUsers() {
  const ignoredUsers = await fetchIgnoredUsers()

  form.ignoredUsers.value = ignoredUsers.join("\n")
}

function setTagMenuVisibility() {
  const tagMenu = document.querySelector<HTMLDivElement>("#tag-menu")
  tagMenu.hidden = !form.enableTagThreads.checked
}

// events
const form = document.querySelector<SettingsForm>("form")
const loadIgnoredusers =
  document.querySelector<HTMLSpanElement>("#loadIgnoredusers")
const addTagButton = document.querySelector<HTMLButtonElement>("#addTag")
const restoreDefaultPrompt = document.querySelector<HTMLSpanElement>(
  "#restoreDefaultPrompt",
)

form.addEventListener("submit", onSubmit)
loadIgnoredusers.addEventListener("click", setIgnoredUsers)
addTagButton.addEventListener("click", addTag)
restoreDefaultPrompt.addEventListener("click", setDefaultPrompt)
form.enableTagThreads.addEventListener("change", setTagMenuVisibility)

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
  loadTags()
  setTagMenuVisibility()

  form.submitButton.disabled = true

  // detect changes and enable button
  form.addEventListener("input", updateSaveButtonState)
})
