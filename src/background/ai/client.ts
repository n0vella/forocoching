import { createAnthropic } from "@ai-sdk/anthropic"
import { createDeepSeek } from "@ai-sdk/deepseek"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createGroq } from "@ai-sdk/groq"
import { createMistral } from "@ai-sdk/mistral"
import { createOpenAI } from "@ai-sdk/openai"
import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import { createXai } from "@ai-sdk/xai"
import type { LanguageModel } from "ai"
import { getProviderDefinition } from "../../shared/providers"
import type { AISettings } from "../../shared/types"
import { AIConfigError } from "./errors"

function cleanEndpoint(url: string): string {
  return url.trim().replace(/\/+$/, "")
}

export function resolveEndpoint(config: AISettings): string {
  const def = getProviderDefinition(config.provider)
  const custom = cleanEndpoint(config.endpoint)
  return custom || def.defaultEndpoint
}

function normalizeOllamaEndpoint(endpoint: string): string {
  const cleaned = cleanEndpoint(endpoint)
  if (!cleaned) return "http://localhost:11434/v1"
  return cleaned.endsWith("/v1") ? cleaned : `${cleaned}/v1`
}

export function validateAIConfig(config: AISettings): void {
  const def = getProviderDefinition(config.provider)

  if (!config.model.trim()) {
    throw new AIConfigError("Debes indicar un modelo de IA en la configuración.")
  }

  if (def.requiresApiKey && !config.apiKey.trim()) {
    throw new AIConfigError(
      `El proveedor ${def.name} requiere una API Key. Configúrala en las opciones.`,
    )
  }

  if (config.provider === "custom" && !config.endpoint.trim()) {
    throw new AIConfigError(
      "Para el proveedor personalizado debes indicar una URL de endpoint (Base URL).",
    )
  }
}

export function createLanguageModel(config: AISettings): LanguageModel {
  validateAIConfig(config)

  const apiKey = config.apiKey.trim()
  const modelId = config.model.trim()
  const customEndpoint = cleanEndpoint(config.endpoint)

  switch (config.provider) {
    case "openai": {
      const openai = createOpenAI({
        apiKey,
        ...(customEndpoint ? { baseURL: customEndpoint } : {}),
      })
      return customEndpoint ? openai.chat(modelId) : openai(modelId)
    }

    case "anthropic": {
      const anthropic = createAnthropic({
        apiKey,
        ...(customEndpoint ? { baseURL: customEndpoint } : {}),
        headers: {
          "anthropic-dangerous-direct-browser-access": "true",
        },
      })
      return anthropic(modelId)
    }

    case "google": {
      const google = createGoogleGenerativeAI({
        apiKey,
        ...(customEndpoint ? { baseURL: customEndpoint } : {}),
      })
      return google(modelId)
    }

    case "mistral": {
      const mistral = createMistral({
        apiKey,
        ...(customEndpoint ? { baseURL: customEndpoint } : {}),
      })
      return mistral(modelId)
    }

    case "groq": {
      const groq = createGroq({
        apiKey,
        ...(customEndpoint ? { baseURL: customEndpoint } : {}),
      })
      return groq(modelId)
    }

    case "deepseek": {
      const deepseek = createDeepSeek({
        apiKey,
        ...(customEndpoint ? { baseURL: customEndpoint } : {}),
      })
      return deepseek(modelId)
    }

    case "xai": {
      const xai = createXai({
        apiKey,
        ...(customEndpoint ? { baseURL: customEndpoint } : {}),
      })
      return xai(modelId)
    }

    case "openrouter": {
      const openrouter = createOpenAICompatible({
        name: "openrouter",
        apiKey,
        baseURL: customEndpoint || "https://openrouter.ai/api/v1",
        headers: {
          "HTTP-Referer": "https://forocoches.com",
          "X-Title": "Forocoching",
        },
      })
      return openrouter.chatModel(modelId)
    }

    case "ollama": {
      const ollama = createOpenAICompatible({
        name: "ollama",
        apiKey: apiKey || "ollama",
        baseURL: normalizeOllamaEndpoint(customEndpoint),
      })
      return ollama.chatModel(modelId)
    }

    case "lmstudio": {
      const lmstudio = createOpenAICompatible({
        name: "lmstudio",
        apiKey: apiKey || "lm-studio",
        baseURL: customEndpoint || "http://localhost:1234/v1",
      })
      return lmstudio.chatModel(modelId)
    }

    case "custom": {
      const custom = createOpenAICompatible({
        name: "custom",
        apiKey: apiKey || "no-key",
        baseURL: customEndpoint,
      })
      return custom.chatModel(modelId)
    }
  }
}
