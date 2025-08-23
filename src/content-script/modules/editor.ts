function pasteLink(e: ClipboardEvent, iframe: HTMLIFrameElement) {
  const text = e.clipboardData?.getData("text")
  if (!text) return

  const patterns = {
    youtube:
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    ig: /(?:instagram\.com\/(?:p|reel)\/)([\w-]+)/,
    tweet: /(?:x\.com\/\w+\/status\/)(\d+)/,
    tiktok: /(?:tiktok\.com\/@[\w.]+\/video\/)(\d+)/,
  }

  for (const [platform, regex] of Object.entries(patterns)) {
    const match = text.match(regex)

    // embed social media link
    if (match && match[1]) {
      insertTextOnEditor(
        e,
        iframe,
        `[${platform.toUpperCase()}]${match[1]}[/${platform.toUpperCase()}]<br>`,
      )
      return
    }
  }
}

function insertTextOnEditor(
  e: ClipboardEvent,
  iframe: HTMLIFrameElement,
  text: string,
) {
  e.preventDefault()
  e.stopPropagation()

  const textField = e.target as HTMLElement
  if (!textField) return

  const target =
    (textField.querySelector("div:last-child") as HTMLElement) ?? textField

  removeTrailingLineBreaks(target)

  target.innerHTML += text
  moveCursorToEnd(iframe, target)

  e.preventDefault()
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
) {
  const doc = iframe.contentDocument || iframe.contentWindow?.document
  const wind = iframe.contentWindow
  if (!doc || !wind) return

  if (!element) {
    element = doc.body
  }

  const range = doc.createRange()

  range.selectNodeContents(element)
  range.collapse(false)

  const selection = wind.getSelection()
  if (!selection) return

  selection.removeAllRanges()
  selection.addRange(range)
}

export function trackPastedLinks() {
  if (!settings.socialMediaLinks) return

  const iframe = document.querySelector(
    "#vB_Editor_001_iframe, #vB_Editor_QR_iframe",
  ) as HTMLIFrameElement
  const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document
  if (!iframeDoc) return

  const handlePaste = (e: ClipboardEvent) => {
    pasteLink(e, iframe)
  }

  const textArea = iframeDoc.querySelector("body")
  textArea?.addEventListener("paste", handlePaste)
}
