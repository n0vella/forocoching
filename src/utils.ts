import defaultSettings from "./defaultSettings.json"
import merge from "lodash/merge"
import isEqual from "lodash/isEqual"

export async function loadSettings() {
  const settings = (await chrome.storage.local.get("settings")).settings as
    | Settings
    | undefined

  const loadedSettings = merge({ ...defaultSettings }, settings)

  if (typeof window !== "undefined") {
    window.settings = loadedSettings
  }

  return loadedSettings
}

export async function fetchIgnoredUsers() {
  let headers

  if (chrome.cookies) {
    const cookies = await chrome.cookies.getAll({ domain: "forocoches.com" })

    headers = {
      Cookie: cookies
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; "),
    }
  }

  const r = await fetch(
    "https://forocoches.com/foro/profile.php?do=ignorelist",
    { headers },
  )

  const parser = new DOMParser()
  const html = parser.parseFromString(await r.text(), "text/html")
  return Array.from(html.querySelectorAll("#ignorelist > li > a")).map((iu) =>
    iu.innerHTML.trim(),
  )
}

export function areObjectsEqual(obj1: object, obj2: object) {
  return isEqual(obj1, obj2)
}
