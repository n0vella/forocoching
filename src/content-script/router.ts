import { getSettings } from "./context"
import { trackPastedLinks } from "./modules/editor"
import { filterStrings, tagThreads } from "./modules/forumdisplay"
import { updateIgnoredUsers } from "./modules/ignoredUsers"

export default function router(): void {
  const settings = getSettings()

  switch (location.pathname) {
    case "/foro/forumdisplay.php":
      filterStrings()
      if (settings.ai.enableTagThreads) {
        tagThreads()
      }
      return

    case "/foro/member.php":
    case "/foro/profile.php":
      updateIgnoredUsers()
      return

    case "/foro/newthread.php":
    case "/foro/newreply.php":
    case "/foro/showthread.php":
      trackPastedLinks()
      return
  }
}
