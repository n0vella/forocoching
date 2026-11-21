import { migrateSettings } from "./defaultSettings"
import type { Settings } from "./types"

export async function loadSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get("settings")
  return migrateSettings(result.settings)
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.sync.set({ settings })
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true

  if (
    typeof a !== "object" ||
    typeof b !== "object" ||
    a === null ||
    b === null
  ) {
    return false
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false
    }
    return true
  }

  const keysA = Object.keys(a as Record<string, unknown>)
  const keysB = Object.keys(b as Record<string, unknown>)
  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false
    if (
      !deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
      )
    ) {
      return false
    }
  }

  return true
}
