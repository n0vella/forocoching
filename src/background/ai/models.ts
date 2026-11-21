import { getProviderDefinition } from "../../shared/providers"
import type { AIModelInfo, AISettings } from "../../shared/types"
import { resolveEndpoint } from "./client"

const DISCOVERY_TIMEOUT_MS = 10_000

async function fetchJson(
  url: string,
  headers: Record<string, string> = {},
): Promise<unknown> {
  const response = await fetch(url, {
    method: "GET",
    headers,
    signal: AbortSignal.timeout(DISCOVERY_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} al listar modelos`)
  }

  return response.json()
}

function extractOpenAIStyleModels(payload: unknown): AIModelInfo[] {
  const data = (payload as { data?: unknown })?.data
  if (!Array.isArray(data)) return []

  const models: AIModelInfo[] = []
  const seen = new Set<string>()

  for (const item of data) {
    if (!item || typeof item !== "object") continue
    const record = item as Record<string, unknown>
    const id = typeof record.id === "string" ? record.id.trim() : ""
    if (!id || seen.has(id)) continue
    seen.add(id)

    models.push({
      id,
      name: typeof record.name === "string" ? record.name : undefined,
      description:
        typeof record.description === "string"
          ? record.description.slice(0, 120)
          : undefined,
    })
  }

  return models.sort((a, b) => a.id.localeCompare(b.id))
}

async function fetchGoogleModels(
  baseUrl: string,
  apiKey: string,
): Promise<AIModelInfo[]> {
  const url = `${baseUrl}/models?key=${encodeURIComponent(apiKey)}&pageSize=100`
  const payload = (await fetchJson(url)) as { models?: unknown[] }
  if (!Array.isArray(payload.models)) return []

  const models: AIModelInfo[] = []
  for (const item of payload.models) {
    if (!item || typeof item !== "object") continue
    const record = item as Record<string, unknown>
    const methods = Array.isArray(record.supportedGenerationMethods)
      ? record.supportedGenerationMethods
      : []

    if (!methods.includes("generateContent")) continue

    const rawName = typeof record.name === "string" ? record.name : ""
    const id = rawName.replace(/^models\//, "")
    if (!id) continue

    models.push({
      id,
      name:
        typeof record.displayName === "string" ? record.displayName : undefined,
      description:
        typeof record.description === "string"
          ? record.description.slice(0, 120)
          : undefined,
    })
  }

  return models.sort((a, b) => a.id.localeCompare(b.id))
}

async function fetchOllamaModels(baseUrl: string): Promise<AIModelInfo[]> {
  const rootUrl = baseUrl.replace(/\/v1\/?$/, "")
  try {
    const payload = (await fetchJson(`${rootUrl}/api/tags`)) as {
      models?: unknown[]
    }
    if (Array.isArray(payload.models)) {
      const models = payload.models
        .map((item) => {
          if (!item || typeof item !== "object") return null
          const record = item as Record<string, unknown>
          const id =
            typeof record.name === "string"
              ? record.name
              : typeof record.model === "string"
                ? record.model
                : ""
          return id ? ({ id } as AIModelInfo) : null
        })
        .filter((m): m is AIModelInfo => m !== null)

      if (models.length > 0) return models
    }
  } catch {
    // Fallback to OpenAI-compatible /v1/models
  }

  const v1Url = baseUrl.endsWith("/v1") ? baseUrl : `${rootUrl}/v1`
  const payload = await fetchJson(`${v1Url}/models`)
  return extractOpenAIStyleModels(payload)
}

export async function fetchProviderModels(
  config: AISettings,
): Promise<{ models: AIModelInfo[]; source: "api" | "preset" }> {
  const def = getProviderDefinition(config.provider)
  const baseUrl = resolveEndpoint(config)
  const apiKey = config.apiKey.trim()

  if (!baseUrl) {
    return { models: [...def.suggestedModels], source: "preset" }
  }

  // Providers that require auth to query /models (except OpenRouter, which is public)
  if (def.requiresApiKey && !apiKey && config.provider !== "openrouter") {
    return { models: [...def.suggestedModels], source: "preset" }
  }

  let models: AIModelInfo[] = []

  switch (config.provider) {
    case "google": {
      models = await fetchGoogleModels(baseUrl, apiKey)
      break
    }

    case "anthropic": {
      const payload = await fetchJson(`${baseUrl}/models`, {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      })
      models = extractOpenAIStyleModels(payload)
      break
    }

    case "ollama": {
      models = await fetchOllamaModels(baseUrl)
      break
    }

    default: {
      const headers: Record<string, string> = {}
      if (apiKey) {
        headers.Authorization = `Bearer ${apiKey}`
      }
      const payload = await fetchJson(`${baseUrl}/models`, headers)
      models = extractOpenAIStyleModels(payload)
      break
    }
  }

  if (models.length === 0) {
    return { models: [...def.suggestedModels], source: "preset" }
  }

  return { models, source: "api" }
}
