declare const browser: typeof import("webextension-polyfill")

interface Message {
  action: "log" | string
  content: any
}

declare function log(...args: any[]): void

interface Settings {
  filteredStrings: string[]
  ignoredUsers: string[]
  trackIgnoredUsers: boolean
}

interface Window {
  settings: Settings
  mobile: boolean
}

declare const settings: Settings
declare const mobile: boolean
