import { sendRuntimeMessage } from "../../shared/messaging"
import type { ChatMessage, Thread } from "../../shared/types"
import { getSettings, log, logError } from "../context"

interface TagCache {
  key: string
  tags: string[]
}

const CACHE_STORAGE_KEY = "fcTagCache"

function hashString(input: string): string {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16)
}

function buildCacheKey(threadIds: number[]): string {
  const { ai } = getSettings()
  const payload = JSON.stringify({
    threadIds,
    provider: ai.provider,
    model: ai.model,
    prompt: ai.prompt,
    tags: ai.tags.map((t) => [t.tagName, t.description]),
  })
  return hashString(payload)
}

async function getCachedTags(cacheKey: string): Promise<string[] | null> {
  const stored = await chrome.storage.local.get(CACHE_STORAGE_KEY)
  const cache = stored[CACHE_STORAGE_KEY] as TagCache | undefined
  if (cache && cache.key === cacheKey && Array.isArray(cache.tags)) {
    return cache.tags
  }
  return null
}

async function saveCachedTags(cacheKey: string, tags: string[]): Promise<void> {
  const cache: TagCache = { key: cacheKey, tags }
  await chrome.storage.local.set({ [CACHE_STORAGE_KEY]: cache })
}

function extractJsonArray(rawText: string): unknown[] | null {
  // Strip <think>...</think> blocks emitted by reasoning models (e.g. DeepSeek R1)
  let cleaned = rawText.replace(/<think>[\s\S]*?<\/think>/gi, "").trim()

  // Unwrap markdown code fences if present
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim()
  }

  // Try direct JSON parse first
  try {
    const parsed = JSON.parse(cleaned)
    if (Array.isArray(parsed)) return parsed
    if (parsed && typeof parsed === "object") {
      const firstArray = Object.values(parsed).find(Array.isArray)
      if (firstArray) return firstArray
    }
  } catch {
    // Fall through to bracket extraction
  }

  // Extract outermost JSON array substring
  const start = cleaned.indexOf("[")
  const end = cleaned.lastIndexOf("]")
  if (start === -1 || end === -1 || end <= start) return null

  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1))
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function mapTagsToThreads(items: unknown[], threads: Thread[]): string[] {
  const byTitle = new Map<string, string>()

  for (const item of items) {
    if (item && typeof item === "object") {
      const record = item as Record<string, unknown>
      const title =
        typeof record.title === "string" ? record.title.trim().toLowerCase() : ""
      const tag = typeof record.tag === "string" ? record.tag.trim() : ""
      if (title && tag) {
        byTitle.set(title, tag)
      }
    }
  }

  return threads.map((thread, index) => {
    const matchedByTitle = byTitle.get(thread.title.trim().toLowerCase())
    if (matchedByTitle) return matchedByTitle

    const positional = items[index]
    if (positional && typeof positional === "object") {
      const tag = (positional as Record<string, unknown>).tag
      if (typeof tag === "string") return tag.trim()
    }

    return "otros"
  })
}

export async function tagger(threads: Thread[]): Promise<string[]> {
  if (threads.length === 0) return []

  const settings = getSettings()
  if (settings.ai.tags.length === 0) return []

  const cacheKey = buildCacheKey(threads.map((t) => t.id))
  const cached = await getCachedTags(cacheKey)
  if (cached && cached.length === threads.length) {
    return cached
  }

  const tagsDescription = settings.ai.tags
    .map(({ tagName, description }) => `"${tagName}": ${description}`)
    .join("\n")

  const prompt = settings.ai.prompt.replace("{tags}", tagsDescription)

  const payload = JSON.stringify(
    threads.map(({ title, content }) => ({
      title,
      content,
      tag: "",
    })),
    null,
    2,
  )

  const messages: ChatMessage[] = [
    { role: "system", content: prompt },
    { role: "user", content: payload },
  ]

  const response = await sendRuntimeMessage({
    action: "ai:generate",
    messages,
  })

  if (!response.ok) {
    logError("Error al clasificar hilos con IA:", response.error)
    return []
  }

  const parsedItems = extractJsonArray(response.data.text)
  if (!parsedItems) {
    logError("La respuesta de la IA no contiene un array JSON válido.")
    log("Respuesta recibida:", response.data.text)
    return []
  }

  const tags = mapTagsToThreads(parsedItems, threads)
  await saveCachedTags(cacheKey, tags)
  return tags
}
