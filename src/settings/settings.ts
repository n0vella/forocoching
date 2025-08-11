import { loadSettings } from "../utils"

interface SettingsForm extends HTMLFormElement {
  filteredStrings: HTMLTextAreaElement
  ignoredUsers: HTMLTextAreaElement
}

function onSubmit(e: SubmitEvent) {
  e.preventDefault()

  const form = e.currentTarget as SettingsForm

  const filteredStrings = form.filteredStrings.value.trim().split("\n")
  const ignoredUsers = form.ignoredUsers.value.trim().split("\n")

  const updatedSettings = {
    filteredStrings,
    ignoredUsers,
  }

  // set settings
  browser.storage.local.set({ settings: updatedSettings })
}

async function fetchIgnoredUsers() {
  const cookies = await browser.cookies.getAll({ domain: "forocoches.com" })

  const r = await fetch(
    "https://forocoches.com/foro/profile.php?do=ignorelist",
    {
      headers: {
        Cookie: cookies
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join("; "),
      },
    },
  )

  const parser = new DOMParser()
  const html = parser.parseFromString(await r.text(), "text/html")
  const ignoredUsers = Array.from(
    html.querySelectorAll("#ignorelist > li > a"),
  ).map((iu) => iu.innerHTML.trim())

  form.ignoredUsers.value = ignoredUsers.join("\n")
}

// events
const form = document.querySelector("form")
const loadIgnoredusers =
  document.querySelector<HTMLSpanElement>("#loadIgnoredusers")

form.addEventListener("submit", onSubmit)
loadIgnoredusers.addEventListener("click", fetchIgnoredUsers)

// set values from settings
loadSettings().then(() => {
  form.filteredStrings.value = settings.filteredStrings.join("\n")
  form.ignoredUsers.value = settings.ignoredUsers.join("\n")
})
