import { fetchIgnoredUsers } from "../../utils"

export async function updateIgnoredUsers() {
  if (!settings.trackIgnoredUsers) return

  const ignoredUsers = await fetchIgnoredUsers()

  if (ignoredUsers !== settings.ignoredUsers) {
    chrome.storage.sync.set({
      settings: {
        ...settings,
        ignoredUsers,
      },
    })
  }
}
