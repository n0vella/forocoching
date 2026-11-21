import { generateText } from "ai"
import { loadSettings } from "../../shared/storage"
import type {
  AIModelInfo,
  AIResult,
  AISettings,
  ChatMessage,
} from "../../shared/types"
import { createLanguageModel } from "./client"
import { formatAIError } from "./errors"
import { fetchProviderModels } from "./models"

async function resolveAIConfig(
  override?: Partial<AISettings>,
): Promise<AISettings> {
  const settings = await loadSettings()
  if (!override) return settings.ai
  return {
    ...settings.ai,
    ...override,
  }
}

export async function generateCompletion(
  messages: ChatMessage[],
  configOverride?: Partial<AISettings>,
): Promise<AIResult<{ text: string }>> {
  let config: AISettings | undefined

  try {
    config = await resolveAIConfig(configOverride)
    const model = createLanguageModel(config)

    const systemParts: string[] = []
    const conversationMessages: Array<{
      role: "user" | "assistant"
      content: string
    }> = []

    for (const msg of messages) {
      if (msg.role === "system") {
        if (msg.content.trim()) systemParts.push(msg.content)
      } else {
        conversationMessages.push({ role: msg.role, content: msg.content })
      }
    }

    const instructions =
      systemParts.length > 0 ? systemParts.join("\n\n") : undefined

    const result = await generateText({
      model,
      ...(instructions ? { instructions } : {}),
      messages: conversationMessages,
      temperature: config.temperature,
      maxRetries: 2,
      abortSignal: AbortSignal.timeout(config.timeoutMs),
    })

    return {
      ok: true,
      data: { text: result.text },
    }
  } catch (error) {
    return {
      ok: false,
      error: formatAIError(error, config?.provider),
    }
  }
}

export async function testConnection(
  configOverride?: Partial<AISettings>,
): Promise<AIResult<{ latencyMs: number; model: string; preview: string }>> {
  let config: AISettings | undefined

  try {
    config = await resolveAIConfig(configOverride)
    const model = createLanguageModel(config)
    const startedAt = Date.now()

    const result = await generateText({
      model,
      prompt: "Responde únicamente con la palabra: OK",
      maxOutputTokens: 16,
      maxRetries: 0,
      abortSignal: AbortSignal.timeout(Math.min(config.timeoutMs, 20_000)),
    })

    return {
      ok: true,
      data: {
        latencyMs: Date.now() - startedAt,
        model: config.model.trim(),
        preview: result.text.trim().slice(0, 60) || "OK",
      },
    }
  } catch (error) {
    return {
      ok: false,
      error: formatAIError(error, config?.provider),
    }
  }
}

export async function listModels(
  configOverride?: Partial<AISettings>,
): Promise<AIResult<{ models: AIModelInfo[]; source: "api" | "preset" }>> {
  let config: AISettings | undefined

  try {
    config = await resolveAIConfig(configOverride)
    const result = await fetchProviderModels(config)
    return { ok: true, data: result }
  } catch (error) {
    return {
      ok: false,
      error: formatAIError(error, config?.provider),
    }
  }
}
