export async function fetchIgnoredUsers(): Promise<string[]> {
  let headers: Record<string, string> | undefined

  if (typeof chrome !== "undefined" && chrome.cookies) {
    const cookies = await chrome.cookies.getAll({ domain: "forocoches.com" })
    if (cookies.length > 0) {
      headers = {
        Cookie: cookies
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join("; "),
      }
    }
  }

  const response = await fetch(
    "https://forocoches.com/foro/profile.php?do=ignorelist",
    {
      headers,
      credentials: "include",
    },
  )

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} al cargar la lista de ignorados`)
  }

  const parser = new DOMParser()
  const html = parser.parseFromString(await response.text(), "text/html")

  return Array.from(html.querySelectorAll("#ignorelist > li > a"))
    .map((el) => el.textContent?.trim() ?? "")
    .filter(Boolean)
}
