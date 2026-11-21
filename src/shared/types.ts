export type AIProviderId =
  | "openai"
  | "anthropic"
  | "google"
  | "openrouter"
  | "groq"
  | "deepseek"
  | "mistral"
  | "xai"
  | "ollama"
  | "lmstudio"
  | "custom"

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface Tag {
  tagName: string
  description: string
  color: string
  hide: boolean
}

export interface AISettings {
  enableTagThreads: boolean
  provider: AIProviderId
  endpoint: string
  apiKey: string
  model: string
  temperature: number
  timeoutMs: number
  prompt: string
  tags: Tag[]
}

export interface Settings {
  filteredStrings: string[]
  ignoredUsers: string[]
  trackIgnoredUsers: boolean
  socialMediaLinks: boolean
  ai: AISettings
}

export interface AIModelInfo {
  id: string
  name?: string
  description?: string
}

export type AIResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export type RuntimeRequest =
  | {
      action: "ai:generate"
      messages: ChatMessage[]
      configOverride?: Partial<AISettings>
    }
  | {
      action: "ai:test"
      configOverride?: Partial<AISettings>
    }
  | {
      action: "ai:listModels"
      configOverride?: Partial<AISettings>
    }
  | {
      action: "log"
      content: unknown[]
    }

export type RuntimeResponseMap = {
  "ai:generate": AIResult<{ text: string }>
  "ai:test": AIResult<{ latencyMs: number; model: string; preview: string }>
  "ai:listModels": AIResult<{ models: AIModelInfo[]; source: "api" | "preset" }>
  log: { ok: true }
}

export type RuntimeResponse<T extends RuntimeRequest["action"]> =
  RuntimeResponseMap[T]

export interface Thread {
  id: number
  title: string
  author: string
  content: string
  hide: () => void
  blur: () => void
  changeColor: (color: string) => void
}
