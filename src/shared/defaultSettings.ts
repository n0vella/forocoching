import { AI_PROVIDERS, inferProviderFromEndpoint } from "./providers"
import type { AIProviderId, Settings, Tag } from "./types"

export const DEFAULT_PROMPT =
  'Completa el siguiente diccionario asignando tags a los siguientes temas de un foro:\n\nLos tags son:\n{tags}\n"otros": Temas que no encajen en ninguna categoría\n\nResponde únicamente con un array JSON válido donde cada objeto tenga las propiedades "title" y "tag".'

export const DEFAULT_TAGS: Tag[] = [
  {
    color: "#86198f",
    description: "Temas sobre política española o internacional",
    hide: false,
    tagName: "política",
  },
  {
    color: "#16a34a",
    description:
      'Temas sobre fútbol, peñas deportivas, a veces incluyen "+18" en el título',
    hide: false,
    tagName: "deportes",
  },
  {
    color: "#dc2626",
    description:
      'Temas con contenido sexual, para ser de esta categoría el título debe incluir obligatoriamente "+18" o "+16"',
    hide: false,
    tagName: "porno",
  },
]

export const DEFAULT_SETTINGS: Settings = {
  filteredStrings: [],
  ignoredUsers: [],
  trackIgnoredUsers: false,
  socialMediaLinks: true,
  ai: {
    enableTagThreads: false,
    provider: "openai",
    endpoint: "",
    apiKey: "",
    model: "gpt-4o-mini",
    temperature: 0.1,
    timeoutMs: 30000,
    prompt: DEFAULT_PROMPT,
    tags: DEFAULT_TAGS,
  },
}

const VALID_PROVIDER_IDS = new Set<string>(AI_PROVIDERS.map((p) => p.id))

function isValidProviderId(value: unknown): value is AIProviderId {
  return typeof value === "string" && VALID_PROVIDER_IDS.has(value)
}

/**
 * Merges persisted (possibly partial or legacy v0.1.x) settings with defaults,
 * automatically inferring the provider when upgrading from older versions.
 */
export function migrateSettings(raw: unknown): Settings {
  const source =
    raw && typeof raw === "object" ? (raw as Partial<Settings>) : {}
  const rawAi =
    source.ai && typeof source.ai === "object"
      ? (source.ai as Partial<Settings["ai"]>)
      : {}

  const endpoint =
    typeof rawAi.endpoint === "string" ? rawAi.endpoint.trim() : ""

  const provider: AIProviderId = isValidProviderId(rawAi.provider)
    ? rawAi.provider
    : inferProviderFromEndpoint(endpoint)

  const temperature =
    typeof rawAi.temperature === "number" &&
    Number.isFinite(rawAi.temperature) &&
    rawAi.temperature >= 0 &&
    rawAi.temperature <= 2
      ? rawAi.temperature
      : DEFAULT_SETTINGS.ai.temperature

  const timeoutMs =
    typeof rawAi.timeoutMs === "number" &&
    Number.isFinite(rawAi.timeoutMs) &&
    rawAi.timeoutMs >= 5000 &&
    rawAi.timeoutMs <= 180000
      ? rawAi.timeoutMs
      : DEFAULT_SETTINGS.ai.timeoutMs

  const tags = Array.isArray(rawAi.tags)
    ? rawAi.tags
        .filter((t): t is Tag => Boolean(t && typeof t === "object"))
        .map((t) => ({
          tagName: String(t.tagName ?? "").trim(),
          description: String(t.description ?? "").trim(),
          color: typeof t.color === "string" && t.color ? t.color : "#10b981",
          hide: Boolean(t.hide),
        }))
    : DEFAULT_SETTINGS.ai.tags.map((t) => ({ ...t }))

  return {
    filteredStrings: Array.isArray(source.filteredStrings)
      ? source.filteredStrings.map(String)
      : [...DEFAULT_SETTINGS.filteredStrings],
    ignoredUsers: Array.isArray(source.ignoredUsers)
      ? source.ignoredUsers.map(String)
      : [...DEFAULT_SETTINGS.ignoredUsers],
    trackIgnoredUsers:
      typeof source.trackIgnoredUsers === "boolean"
        ? source.trackIgnoredUsers
        : DEFAULT_SETTINGS.trackIgnoredUsers,
    socialMediaLinks:
      typeof source.socialMediaLinks === "boolean"
        ? source.socialMediaLinks
        : DEFAULT_SETTINGS.socialMediaLinks,
    ai: {
      enableTagThreads:
        typeof rawAi.enableTagThreads === "boolean"
          ? rawAi.enableTagThreads
          : DEFAULT_SETTINGS.ai.enableTagThreads,
      provider,
      endpoint,
      apiKey: typeof rawAi.apiKey === "string" ? rawAi.apiKey : "",
      model:
        typeof rawAi.model === "string"
          ? rawAi.model
          : DEFAULT_SETTINGS.ai.model,
      temperature,
      timeoutMs,
      prompt:
        typeof rawAi.prompt === "string" && rawAi.prompt.trim()
          ? rawAi.prompt
          : DEFAULT_SETTINGS.ai.prompt,
      tags,
    },
  }
}
