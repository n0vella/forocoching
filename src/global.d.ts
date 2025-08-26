interface Message {
  action: "log" | "loadModelResponse"
  content: any
}

declare function log(...args: any[]): void

interface Tag {
  tagName: string
  description: string
  color: string
  hide: boolean
}

interface Settings {
  filteredStrings: string[]
  ignoredUsers: string[]
  trackIgnoredUsers: boolean
  socialMediaLinks: boolean
  ai: {
    enableTagThreads: boolean
    endpoint: string
    apiKey: string
    model: string
    prompt: string
    tags: Tag[]
  }
}

interface Window {
  settings: Settings
  mobile: boolean
}

declare const settings: Settings
declare const mobile: boolean

type ChatMessage = import("openai/resources/index").ChatCompletionMessageParam

interface Thread {
  title: string
  author: string
  content: string
  hide: () => void
  changeColor: (color: string) => void
}
