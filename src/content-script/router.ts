import { filterStrings } from "./pages/forumdisplay"

export default function router() {
  switch (location.pathname) {
    case "/foro/forumdisplay.php":
      filterStrings()
  }
}
