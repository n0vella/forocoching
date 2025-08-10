import defaultSettings from "./defaultSettings.json"

export async function loadSettings() {
  const settings = (await browser.storage.local.get("settings")).settings as
    | Settings
    | undefined
  window.settings = { ...defaultSettings, ...settings }
}
