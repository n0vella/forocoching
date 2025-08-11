import { fetchIgnoredUsers } from "../../utils"

export async function updateIgnoredUsers() {
  if (!settings.trackIgnoredUsers) return

  const ignoredUsers = await fetchIgnoredUsers()

  if (ignoredUsers !== settings.ignoredUsers) {
    browser.storage.local.set({
      settings: {
        ...settings,
        ignoredUsers,
      },
    })
  }
}
