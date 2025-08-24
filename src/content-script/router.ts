import { filterStrings, tagThreads } from "./modules/forumdisplay"
import { updateIgnoredUsers } from "./modules/ignoredUsers"
import { trackPastedLinks } from "./modules/editor"

export default function router() {
  switch (location.pathname) {
    case "/foro/forumdisplay.php":
      filterStrings()
      if (settings.ai.enableTagThreads) {
        tagThreads()
      }

      return
    case "/foro/member.php":
      updateIgnoredUsers() // member profile shown after update ignored users
      return
    case "/foro/profile.php":
      updateIgnoredUsers() // profile.php?do=ignorelist
      return
    case "/foro/newthread.php":
    case "/foro/newreply.php":
    case "/foro/showthread.php":
      trackPastedLinks()
  }
}
