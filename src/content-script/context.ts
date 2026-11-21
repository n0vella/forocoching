import { DEFAULT_SETTINGS } from "../shared/defaultSettings"
import type { Settings } from "../shared/types"

let currentSettings: Settings = DEFAULT_SETTINGS
let mobileDevice = false

export function initContext(settings: Settings): void {
  currentSettings = settings
  mobileDevice =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(
      navigator.userAgent,
    )
}

export function getSettings(): Settings {
  return currentSettings
}

export function setSettings(settings: Settings): void {
  currentSettings = settings
}

export function isMobile(): boolean {
  return mobileDevice
}

export function log(...data: unknown[]): void {
  console.log("%cForocoching:", "color: #10b981; font-weight: bold", ...data)
}

export function logError(...data: unknown[]): void {
  console.error("%cForocoching:", "color: #ef4444; font-weight: bold", ...data)
}
