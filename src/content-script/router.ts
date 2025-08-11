import { filterStrings } from "./modules/forumdisplay"
import { updateIgnoredUsers } from "./modules/ignoredUsers"

export default function router() {
  switch (location.pathname) {
    case "/foro/forumdisplay.php":
      filterStrings()
      return
    case "/foro/member.php":
      updateIgnoredUsers() // member profile shown after update ignored users
      return
    case "/foro/profile.php":
      updateIgnoredUsers() // profile.php?do=ignorelist
      return
  }
}
