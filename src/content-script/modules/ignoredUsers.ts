import { fetchIgnoredUsers } from "../../shared/forocoches"
import { deepEqual, saveSettings } from "../../shared/storage"
import { getSettings, logError, setSettings } from "../context"

export async function updateIgnoredUsers(): Promise<void> {
  const settings = getSettings()
  if (!settings.trackIgnoredUsers) return

  try {
    const ignoredUsers = await fetchIgnoredUsers()
    if (!deepEqual(ignoredUsers, settings.ignoredUsers)) {
      const updated = { ...settings, ignoredUsers }
      await saveSettings(updated)
      setSettings(updated)
    }
  } catch (err) {
    logError("No se pudo sincronizar la lista de usuarios ignorados:", err)
  }
}
