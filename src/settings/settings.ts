import { DEFAULT_PROMPT } from "../shared/defaultSettings"
import { fetchIgnoredUsers } from "../shared/forocoches"
import { sendRuntimeMessage } from "../shared/messaging"
import {
  AI_PROVIDERS,
  PROVIDER_CATEGORIES,
  getProviderDefinition,
} from "../shared/providers"
import { deepEqual, loadSettings, saveSettings } from "../shared/storage"
import type {
  AIModelInfo,
  AIProviderId,
  AISettings,
  Settings,
  Tag,
} from "../shared/types"

const CUSTOM_MODEL_OPTION = "__custom__"

interface SettingsForm extends HTMLFormElement {
  filteredStrings: HTMLTextAreaElement
  ignoredUsers: HTMLTextAreaElement
  trackIgnoredUsers: HTMLInputElement
  socialMediaLinks: HTMLInputElement

  provider: HTMLSelectElement
  apiKey: HTMLInputElement
  model: HTMLInputElement
  temperature: HTMLInputElement
  timeoutSec: HTMLInputElement
  enableTagThreads: HTMLInputElement
  prompt: HTMLTextAreaElement

  submitButton: HTMLButtonElement
}

const form = document.querySelector<SettingsForm>("#settingsForm")!
const saveStatus = document.querySelector<HTMLSpanElement>("#saveStatus")!

// AI elements
const providerSelect = document.querySelector<HTMLSelectElement>("#provider")!
const providerDescription = document.querySelector<HTMLParagraphElement>(
  "#providerDescription",
)!
const apiKeyHelpLink =
  document.querySelector<HTMLAnchorElement>("#apiKeyHelpLink")!
const apiKeyOptionalBadge = document.querySelector<HTMLSpanElement>(
  "#apiKeyOptionalBadge",
)!
const toggleApiKeyButton =
  document.querySelector<HTMLButtonElement>("#toggleApiKey")!
const eyeShowIcon = document.querySelector<SVGElement>("#eyeShowIcon")!
const eyeHideIcon = document.querySelector<SVGElement>("#eyeHideIcon")!

const primaryEndpointContainer = document.querySelector<HTMLDivElement>(
  "#primaryEndpointContainer",
)!
const endpointPrimary =
  document.querySelector<HTMLInputElement>("#endpointPrimary")!
const endpointPrimaryHint = document.querySelector<HTMLParagraphElement>(
  "#endpointPrimaryHint",
)!
const advancedEndpointContainer = document.querySelector<HTMLDivElement>(
  "#advancedEndpointContainer",
)!
const endpointAdvanced =
  document.querySelector<HTMLInputElement>("#endpointAdvanced")!

const modelSelect = document.querySelector<HTMLSelectElement>("#modelSelect")!
const loadModelsButton =
  document.querySelector<HTMLButtonElement>("#loadModelsButton")!
const modelsStatus = document.querySelector<HTMLParagraphElement>("#modelsStatus")!

const temperatureValue =
  document.querySelector<HTMLSpanElement>("#temperatureValue")!

const testConnectionButton = document.querySelector<HTMLButtonElement>(
  "#testConnectionButton",
)!
const testResult = document.querySelector<HTMLDivElement>("#testResult")!

// Tags & misc elements
const tagsDiv = document.querySelector<HTMLDivElement>("#tags")!
const tagMenu = document.querySelector<HTMLDivElement>("#tag-menu")!
const addTagButton = document.querySelector<HTMLButtonElement>("#addTag")!
const restoreDefaultPromptButton = document.querySelector<HTMLButtonElement>(
  "#restoreDefaultPrompt",
)!
const loadIgnoredUsersButton =
  document.querySelector<HTMLButtonElement>("#loadIgnoredusers")!
const ignoredUsersStatus = document.querySelector<HTMLParagraphElement>(
  "#ignoredUsersStatus",
)!

let savedSettings: Settings
let currentModels: AIModelInfo[] = []
let tagCounter = 0

function populateProviderOptions(): void {
  providerSelect.innerHTML = ""

  for (const category of PROVIDER_CATEGORIES) {
    const group = document.createElement("optgroup")
    group.label = category.label

    const providers = AI_PROVIDERS.filter((p) => p.category === category.id)
    for (const provider of providers) {
      const option = document.createElement("option")
      option.value = provider.id
      option.textContent = provider.name
      group.appendChild(option)
    }

    providerSelect.appendChild(group)
  }
}

function getActiveEndpointInput(): HTMLInputElement {
  const def = getProviderDefinition(providerSelect.value as AIProviderId)
  return def.showEndpointByDefault ? endpointPrimary : endpointAdvanced
}

function setEndpointValue(value: string): void {
  endpointPrimary.value = value
  endpointAdvanced.value = value
}

function populateModelSelect(
  models: AIModelInfo[],
  selectedModelId: string,
): void {
  currentModels = models
  modelSelect.innerHTML = ""

  if (models.length > 0) {
    for (const model of models) {
      const option = document.createElement("option")
      option.value = model.id
      const label =
        model.name && model.name !== model.id
          ? `${model.name} (${model.id})`
          : model.id
      option.textContent = model.description
        ? `${label} — ${model.description}`
        : label
      modelSelect.appendChild(option)
    }
  }

  const customOption = document.createElement("option")
  customOption.value = CUSTOM_MODEL_OPTION
  customOption.textContent =
    models.length > 0
      ? "Otro modelo (escribir manualmente)..."
      : "Escribir ID del modelo manualmente..."
  modelSelect.appendChild(customOption)

  const match = models.find((m) => m.id === selectedModelId)
  modelSelect.value = match ? match.id : CUSTOM_MODEL_OPTION
}

function syncModelSelectWithInput(): void {
  const value = form.model.value.trim()
  const match = currentModels.find((m) => m.id === value)
  modelSelect.value = match ? match.id : CUSTOM_MODEL_OPTION
}

function updateProviderUI(
  providerId: AIProviderId,
  options: { preserveValues: boolean },
): void {
  const def = getProviderDefinition(providerId)

  providerDescription.textContent = def.description

  if (def.apiKeyUrl) {
    apiKeyHelpLink.href = def.apiKeyUrl
    apiKeyHelpLink.classList.remove("hidden")
  } else {
    apiKeyHelpLink.classList.add("hidden")
  }

  apiKeyOptionalBadge.classList.toggle("hidden", def.requiresApiKey)
  form.apiKey.placeholder = def.apiKeyPlaceholder

  if (def.showEndpointByDefault) {
    primaryEndpointContainer.classList.remove("hidden")
    advancedEndpointContainer.classList.add("hidden")
    endpointPrimary.placeholder =
      def.defaultEndpoint || "https://tu-servidor.com/v1"
    endpointPrimaryHint.textContent =
      providerId === "ollama"
        ? "Por defecto: http://localhost:11434/v1. Asegúrate de tener Ollama en marcha (OLLAMA_ORIGINS=*)."
        : providerId === "lmstudio"
          ? "Por defecto: http://localhost:1234/v1. Activa el servidor local y CORS en LM Studio."
          : "URL base compatible con la API de OpenAI (normalmente termina en /v1)."
  } else {
    primaryEndpointContainer.classList.add("hidden")
    advancedEndpointContainer.classList.remove("hidden")
    endpointAdvanced.placeholder = def.defaultEndpoint
  }

  if (!options.preserveValues) {
    setEndpointValue(def.showEndpointByDefault ? def.defaultEndpoint : "")
    const firstModel = def.suggestedModels[0]?.id ?? ""
    form.model.value = firstModel
    modelsStatus.textContent =
      def.suggestedModels.length > 0
        ? "Mostrando modelos sugeridos. Pulsa 'Cargar modelos disponibles' para consultar la API."
        : "Introduce el ID del modelo o pulsa 'Cargar modelos disponibles'."
    testResult.classList.add("hidden")
  }

  populateModelSelect([...def.suggestedModels], form.model.value.trim())
}

function buildAISettingsFromForm(): AISettings {
  const tags = Array.from(
    tagsDiv.querySelectorAll<HTMLDivElement>(".tag-container"),
  )
    .map((container) => {
      const tagName =
        container
          .querySelector<HTMLInputElement>('[data-field="tagName"]')
          ?.value.trim() ?? ""
      const description =
        container
          .querySelector<HTMLInputElement>('[data-field="description"]')
          ?.value.trim() ?? ""
      const color =
        container.querySelector<HTMLInputElement>('[data-field="color"]')
          ?.value ?? "#10b981"
      const hide =
        container.querySelector<HTMLInputElement>('[data-field="hide"]')
          ?.checked ?? false
      return { tagName, description, color, hide }
    })
    .filter((tag) => tag.tagName && tag.description)

  const parsedTemp = Number.parseFloat(form.temperature.value)
  const parsedTimeoutSec = Number.parseInt(form.timeoutSec.value, 10)

  return {
    enableTagThreads: form.enableTagThreads.checked,
    provider: providerSelect.value as AIProviderId,
    endpoint: getActiveEndpointInput().value.trim(),
    apiKey: form.apiKey.value.trim(),
    model: form.model.value.trim(),
    temperature: Number.isFinite(parsedTemp) ? parsedTemp : 0.1,
    timeoutMs:
      Number.isFinite(parsedTimeoutSec) && parsedTimeoutSec >= 5
        ? parsedTimeoutSec * 1000
        : 30_000,
    prompt: form.prompt.value,
    tags,
  }
}

function getUpdatedSettings(): Settings {
  const filteredStrings = form.filteredStrings.value
    .split("\n")
    .map((line) => line.toLowerCase().trim())
    .filter(Boolean)

  const ignoredUsers = form.ignoredUsers.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  return {
    filteredStrings,
    ignoredUsers,
    trackIgnoredUsers: form.trackIgnoredUsers.checked,
    socialMediaLinks: form.socialMediaLinks.checked,
    ai: buildAISettingsFromForm(),
  }
}

function updateSaveButtonState(): void {
  if (!savedSettings) return
  const hasChanges = !deepEqual(savedSettings, getUpdatedSettings())
  form.submitButton.disabled = !hasChanges

  if (hasChanges) {
    saveStatus.textContent = "Cambios sin guardar"
    saveStatus.className = "hidden text-xs font-medium text-amber-600 sm:inline"
  } else {
    saveStatus.textContent = ""
    saveStatus.className = "hidden"
  }
}

function appendTagElement(tag: Tag): void {
  tagCounter += 1
  const container = document.createElement("div")
  container.className = "tag-container"
  container.dataset.tagId = String(tagCounter)

  const nameInput = document.createElement("input")
  nameInput.type = "text"
  nameInput.placeholder = "Nombre del tag"
  nameInput.value = tag.tagName
  nameInput.dataset.field = "tagName"
  nameInput.className = "user-input w-full text-sm sm:w-40"

  const descInput = document.createElement("input")
  descInput.type = "text"
  descInput.placeholder = "Descripción para que la IA lo reconozca"
  descInput.value = tag.description
  descInput.dataset.field = "description"
  descInput.className = "user-input w-full flex-1 text-sm"

  const colorInput = document.createElement("input")
  colorInput.type = "color"
  colorInput.title = "Color del título"
  colorInput.value = tag.color || "#10b981"
  colorInput.dataset.field = "color"
  colorInput.className =
    "h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-zinc-300 bg-white p-0.5"

  const eyeLabel = document.createElement("label")
  eyeLabel.className = "eye-checkbox"
  eyeLabel.innerHTML = `
    <input type="checkbox" data-field="hide" />
    <svg data-eye="open" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>
    <svg data-eye="closed" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" /><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" /><path d="M3 3l18 18" /></svg>
  `

  const hideInput = eyeLabel.querySelector<HTMLInputElement>("input")!
  hideInput.checked = tag.hide

  const updateEyeTitle = () => {
    const labelName = nameInput.value.trim() || "este tag"
    eyeLabel.title = hideInput.checked
      ? `Difuminar hilos con "${labelName}" (pulsa para mostrarlos)`
      : `Mostrar hilos con "${labelName}" (pulsa para difuminarlos)`
  }
  updateEyeTitle()
  hideInput.addEventListener("change", () => {
    updateEyeTitle()
    updateSaveButtonState()
  })
  nameInput.addEventListener("input", updateEyeTitle)

  const removeButton = document.createElement("button")
  removeButton.type = "button"
  removeButton.title = "Eliminar tag"
  removeButton.className = "btn-danger-icon"
  removeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>`
  removeButton.addEventListener("click", () => {
    container.remove()
    updateSaveButtonState()
  })

  container.append(nameInput, descInput, colorInput, eyeLabel, removeButton)
  tagsDiv.appendChild(container)
}

function setTagMenuVisibility(): void {
  tagMenu.hidden = !form.enableTagThreads.checked
}

async function handleLoadModels(): Promise<void> {
  const originalText = loadModelsButton.textContent
  loadModelsButton.disabled = true
  loadModelsButton.textContent = "Cargando..."
  modelsStatus.textContent = "Consultando modelos del proveedor..."

  const configOverride = buildAISettingsFromForm()
  const response = await sendRuntimeMessage({
    action: "ai:listModels",
    configOverride,
  })

  loadModelsButton.disabled = false
  loadModelsButton.textContent = originalText

  if (!response.ok) {
    modelsStatus.textContent = `No se pudieron cargar los modelos: ${response.error}`
    return
  }

  const { models, source } = response.data
  populateModelSelect(models, form.model.value.trim())

  if (source === "api") {
    modelsStatus.textContent = `${models.length} modelos cargados desde la API del proveedor.`
    if (!form.model.value.trim() && models[0]) {
      form.model.value = models[0].id
      modelSelect.value = models[0].id
      updateSaveButtonState()
    }
  } else {
    modelsStatus.textContent =
      models.length > 0
        ? "Mostrando modelos sugeridos (introduce tu API Key para consultar el catálogo completo)."
        : "No se encontraron modelos automáticamente; escribe el ID manualmente."
  }
}

async function handleTestConnection(): Promise<void> {
  const originalText = testConnectionButton.textContent
  testConnectionButton.disabled = true
  testConnectionButton.textContent = "Probando..."

  testResult.classList.remove(
    "hidden",
    "border-emerald-200",
    "bg-emerald-50",
    "text-emerald-800",
    "border-red-200",
    "bg-red-50",
    "text-red-800",
  )
  testResult.classList.add("border-zinc-200", "bg-zinc-50", "text-zinc-700")
  testResult.textContent = "Enviando petición de prueba al modelo..."

  const configOverride = buildAISettingsFromForm()
  const response = await sendRuntimeMessage({
    action: "ai:test",
    configOverride,
  })

  testConnectionButton.disabled = false
  testConnectionButton.textContent = originalText
  testResult.classList.remove("border-zinc-200", "bg-zinc-50", "text-zinc-700")

  if (response.ok) {
    testResult.classList.add(
      "border-emerald-200",
      "bg-emerald-50",
      "text-emerald-800",
    )
    testResult.textContent = `Conexión correcta con ${response.data.model} (${response.data.latencyMs} ms). Respuesta: "${response.data.preview}"`
  } else {
    testResult.classList.add("border-red-200", "bg-red-50", "text-red-800")
    testResult.textContent = response.error
  }
}

async function handleLoadIgnoredUsers(): Promise<void> {
  const originalText = loadIgnoredUsersButton.textContent
  loadIgnoredUsersButton.disabled = true
  loadIgnoredUsersButton.textContent = "Cargando..."
  ignoredUsersStatus.classList.add("hidden")

  try {
    const ignoredUsers = await fetchIgnoredUsers()
    form.ignoredUsers.value = ignoredUsers.join("\n")
    ignoredUsersStatus.textContent =
      ignoredUsers.length > 0
        ? `Se cargaron ${ignoredUsers.length} usuarios ignorados desde ForoCoches.`
        : "No se encontraron usuarios en tu lista de ignorados (comprueba si tienes sesión iniciada en ForoCoches)."
    ignoredUsersStatus.classList.remove("hidden")
    updateSaveButtonState()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    ignoredUsersStatus.textContent = `Error al cargar la lista: ${message}`
    ignoredUsersStatus.classList.remove("hidden")
  } finally {
    loadIgnoredUsersButton.disabled = false
    loadIgnoredUsersButton.textContent = originalText
  }
}

async function handleSubmit(e: SubmitEvent): Promise<void> {
  e.preventDefault()
  form.submitButton.disabled = true

  const updated = getUpdatedSettings()
  await saveSettings(updated)
  savedSettings = await loadSettings()

  saveStatus.textContent = "Guardado ✓"
  saveStatus.className = "hidden text-xs font-medium text-emerald-700 sm:inline"
  setTimeout(() => {
    if (form.submitButton.disabled) {
      saveStatus.textContent = ""
      saveStatus.className = "hidden"
    }
  }, 2500)
}

// Event listeners
populateProviderOptions()

form.addEventListener("submit", handleSubmit)

providerSelect.addEventListener("change", () => {
  updateProviderUI(providerSelect.value as AIProviderId, {
    preserveValues: false,
  })
  updateSaveButtonState()
})

endpointPrimary.addEventListener("input", () => {
  endpointAdvanced.value = endpointPrimary.value
  updateSaveButtonState()
})

endpointAdvanced.addEventListener("input", () => {
  endpointPrimary.value = endpointAdvanced.value
  updateSaveButtonState()
})

toggleApiKeyButton.addEventListener("click", () => {
  const isPassword = form.apiKey.type === "password"
  form.apiKey.type = isPassword ? "text" : "password"
  eyeShowIcon.classList.toggle("hidden", isPassword)
  eyeHideIcon.classList.toggle("hidden", !isPassword)
})

modelSelect.addEventListener("change", () => {
  if (modelSelect.value !== CUSTOM_MODEL_OPTION) {
    form.model.value = modelSelect.value
    updateSaveButtonState()
  } else {
    form.model.focus()
  }
})

form.model.addEventListener("input", () => {
  syncModelSelectWithInput()
  updateSaveButtonState()
})

form.temperature.addEventListener("input", () => {
  temperatureValue.textContent = Number.parseFloat(
    form.temperature.value,
  ).toFixed(2)
  updateSaveButtonState()
})

loadModelsButton.addEventListener("click", handleLoadModels)
testConnectionButton.addEventListener("click", handleTestConnection)
loadIgnoredUsersButton.addEventListener("click", handleLoadIgnoredUsers)

addTagButton.addEventListener("click", () => {
  appendTagElement({
    tagName: "",
    description: "",
    color: "#10b981",
    hide: false,
  })
  updateSaveButtonState()
})

restoreDefaultPromptButton.addEventListener("click", () => {
  form.prompt.value = DEFAULT_PROMPT
  updateSaveButtonState()
})

form.enableTagThreads.addEventListener("change", () => {
  setTagMenuVisibility()
  updateSaveButtonState()
})

form.addEventListener("input", updateSaveButtonState)
form.addEventListener("change", updateSaveButtonState)

// Hydrate initial state
loadSettings().then((settings) => {
  savedSettings = settings

  form.filteredStrings.value = settings.filteredStrings.join("\n")
  form.ignoredUsers.value = settings.ignoredUsers.join("\n")
  form.trackIgnoredUsers.checked = settings.trackIgnoredUsers
  form.socialMediaLinks.checked = settings.socialMediaLinks

  providerSelect.value = settings.ai.provider
  form.apiKey.value = settings.ai.apiKey
  setEndpointValue(settings.ai.endpoint)
  form.model.value = settings.ai.model
  form.temperature.value = String(settings.ai.temperature)
  temperatureValue.textContent = settings.ai.temperature.toFixed(2)
  form.timeoutSec.value = String(Math.round(settings.ai.timeoutMs / 1000))

  updateProviderUI(settings.ai.provider, { preserveValues: true })

  form.enableTagThreads.checked = settings.ai.enableTagThreads
  form.prompt.value = settings.ai.prompt

  tagsDiv.innerHTML = ""
  for (const tag of settings.ai.tags) {
    appendTagElement(tag)
  }
  setTagMenuVisibility()

  form.submitButton.disabled = true
})
