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
    <input placeholder="descripción" value="${tag.description.replace(/"/g, "&quot;")}" class="user-input w-xl max-w-full" />
    <input type="color" title="color" value="${tag.color}" class="rounded-lg cursor-pointer"/>

    <label class="eye-checkbox">
      <input type="checkbox" class="rounded-lg cursor-pointer"/>
      <svg name="closedEye" xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-eye-off"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" /><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" /><path d="M3 3l18 18" /></svg>

      <svg name="openEye" xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-eye"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>
    </label>

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

  const hideButton = tagContainer.querySelector<HTMLInputElement>(
    ".eye-checkbox > input",
  )

  hideButton.checked = tag.hide

  const setHideLabel = () =>
    (hideButton.parentElement.title =
      (hideButton.checked ? "Mostrar" : "Ocultar") +
      ` hilos con el tag "${tag.tagName}"`)

  setHideLabel()
  hideButton.addEventListener("click", setHideLabel)
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
    hide: false,
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
      const [tagName, description, color, hide] = Array.from(
        tag.querySelectorAll<HTMLInputElement>("input"),
      )

      return {
        tagName: tagName.value.trim(),
        description: description.value.trim(),
        color: color.value,
        hide: hide.checked,
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
  await chrome.storage.sync.set({ settings: updatedSettings })
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
