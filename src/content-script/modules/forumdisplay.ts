import type { Thread } from "../../shared/types"
import { getSettings, isMobile, log } from "../context"
import { tagger } from "./ai"

function loadThreads(): Thread[] {
  const threads = document.querySelectorAll<HTMLDivElement>(
    'div:has( > div > span > a[href^="showthread.php?t="])',
  )

  const mobile = isMobile()
  const threadsData: Thread[] = []

  for (const thread of Array.from(threads)) {
    const link = thread.querySelector<HTMLAnchorElement>("a")
    const titleSpan = link?.querySelector<HTMLSpanElement>("span")
    if (!link || !titleSpan) continue

    const authorEl = mobile
      ? thread.querySelector<HTMLSpanElement>(
          'a[href^="showthread.php?p="] > div > span:nth-child(4)',
        )
      : thread.querySelector<HTMLSpanElement>("div > div > a > span")

    const author = authorEl
      ? mobile
        ? authorEl.innerText.trim()
        : authorEl.innerText.split(" - ")[0].slice(1).trim()
      : ""

    const idMatch = link.href.match(/[?&]t=(\d+)/)
    const id = idMatch ? Number(idMatch[1]) : 0

    threadsData.push({
      id,
      title: titleSpan.innerText,
      author,
      content: link.title,
      hide: () => {
        const threadRow = thread.parentElement
        if (!threadRow) return
        threadRow.style.display = "none"
        const separator = threadRow.nextElementSibling as HTMLElement | null
        if (separator) separator.style.display = "none"
      },
      blur: () => {
        const threadRow = thread.parentElement
        if (!threadRow) return
        threadRow.style.position = "relative"

        const blurDiv = document.createElement("div")
        blurDiv.classList.add("fc-blurred-thread")
        blurDiv.addEventListener("click", () => {
          blurDiv.style.display = "none"
        })

        threadRow.appendChild(blurDiv)
      },
      changeColor: (color: string) => {
        titleSpan.style.color = color
      },
    })
  }

  return threadsData
}

export function filterStrings(): void {
  const settings = getSettings()
  const threads = loadThreads()

  function checkTitle(thread: Thread) {
    const title = thread.title.toLowerCase()
    for (const str of settings.filteredStrings) {
      if (
        title === str ||
        title.includes(` ${str} `) ||
        title.endsWith(` ${str}`) ||
        title.startsWith(`${str} `)
      ) {
        thread.hide()
        log(`Hidden thread "${thread.title}" because it contains "${str}"`)
        return
      }
    }
  }

  function checkAuthor(thread: Thread) {
    for (const ignoredUser of settings.ignoredUsers) {
      if (thread.author === ignoredUser) {
        thread.hide()
        log(
          `Hidden thread "${thread.title}" because it is authored by "${ignoredUser}"`,
        )
        return
      }
    }
  }

  for (const thread of threads) {
    checkTitle(thread)
    checkAuthor(thread)
  }
}

export async function tagThreads(): Promise<void> {
  const settings = getSettings()
  const threads = loadThreads()
  if (threads.length === 0) return

  const threadTags = await tagger(threads)

  for (let i = 0; i < threads.length; i++) {
    const assignedTag = threadTags[i]
    if (!assignedTag || assignedTag.toLowerCase() === "otros") continue

    const tag = settings.ai.tags.find(
      (t) => t.tagName.toLowerCase() === assignedTag.toLowerCase(),
    )
    const thread = threads[i]

    if (tag) {
      thread.changeColor(tag.color)
      if (tag.hide) {
        thread.blur()
        log(
          `Blurred thread "${thread.title}" classified as "${tag.tagName}"`,
        )
      }
    }
  }
}
