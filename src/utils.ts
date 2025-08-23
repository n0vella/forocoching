import defaultSettings from "./defaultSettings.json"

export async function loadSettings() {
  const settings = (await browser.storage.local.get("settings")).settings as
    | Settings
    | undefined
  window.settings = { ...defaultSettings, ...settings }
}

export async function fetchIgnoredUsers() {
  let headers

  if (browser.cookies) {
    const cookies = await browser.cookies.getAll({ domain: "forocoches.com" })

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
  try {
    for (const key in obj1) {
      if (typeof obj1[key] == "object") {
        if (!areObjectsEqual(obj1[key], obj2[key])) return false
      } else {
        if (obj1[key] != obj2[key]) return false
      }
    }
    return true
  } catch {
    return false
  }
}
