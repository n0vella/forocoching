import { getSettings, isMobile } from "../context"

function pasteLink(e: ClipboardEvent, callback: (text: string) => void) {
  const text = e.clipboardData?.getData("text")
  if (!text) return

  const patterns = {
    youtube:
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    ig: /(?:instagram\.com\/(?:p|reel)\/)([\w-]+)/,
    tweet: /(?:(?:x|twitter)\.com\/\w+\/status\/)(\d+)/,
    tiktok: /(?:tiktok\.com\/@[\w.]+\/video\/)(\d+)/,
  }

  for (const [platform, regex] of Object.entries(patterns)) {
    const match = text.match(regex)
    if (match && match[1]) {
      e.preventDefault()
      e.stopPropagation()

      const tag = platform.toUpperCase()
      callback(`[${tag}]${match[1]}[/${tag}]`)
      return
    }
  }
}

function removeTrailingLineBreaks(element: HTMLElement) {
  while (
    element.lastChild &&
    (element.lastChild as HTMLElement).tagName === "BR"
  ) {
    element.lastChild.remove()
  }
}

export function moveCursorToEnd(
  iframe: HTMLIFrameElement,
  element?: HTMLElement,
): void {
  const doc = iframe.contentDocument || iframe.contentWindow?.document
  const win = iframe.contentWindow
  if (!doc || !win) return

  const target = element ?? doc.body
  const range = doc.createRange()

  range.selectNodeContents(target)
  range.collapse(false)

  const selection = win.getSelection()
  if (!selection) return

  selection.removeAllRanges()
  selection.addRange(range)
}

function insertTextOnIframeEditor(
  e: ClipboardEvent,
  iframe: HTMLIFrameElement,
  text: string,
) {
  const textField = e.target as HTMLElement | null
  if (!textField) return

  const target =
    (textField.querySelector("div:last-child") as HTMLElement | null) ??
    textField

  removeTrailingLineBreaks(target)

  target.innerHTML += text + "<br>"
  moveCursorToEnd(iframe, target)

  e.preventDefault()
}

export function trackPastedLinks(): void {
  const settings = getSettings()
  if (!settings.socialMediaLinks) return

  if (isMobile() && location.pathname === "/foro/showthread.php") {
    const textArea = document.querySelector<HTMLTextAreaElement>(
      "#vB_Editor_QR_textarea",
    )
    if (!textArea) return

    textArea.addEventListener("paste", (e: ClipboardEvent) => {
      pasteLink(e, (text) => {
        textArea.value += text
      })
    })
  } else {
    const iframe = document.querySelector<HTMLIFrameElement>(
      "#vB_Editor_001_iframe, #vB_Editor_QR_iframe",
    )
    const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document
    if (!iframe || !iframeDoc) return

    const handlePaste = (e: ClipboardEvent) => {
      pasteLink(e, (text) => insertTextOnIframeEditor(e, iframe, text))
    }

    const body = iframeDoc.querySelector("body")
    body?.addEventListener("paste", handlePaste)
  }
}
