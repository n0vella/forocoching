import { tagger } from "./ai"

/**
 * returns thread object
 */
function loadThreads(): Thread[] {
  const threads = document.querySelectorAll<HTMLDivElement>(
    'div:has( > div > span > a[href^="showthread.php?t="])',
  )

  const threadsData: Thread[] = []
  for (const thread of Array.from(threads)) {
    const link = thread.querySelector<HTMLSpanElement>("a")

    const titleSpan = link.querySelector<HTMLSpanElement>("span")

    const author = mobile
      ? thread.querySelector<HTMLSpanElement>(
          'a[href^="showthread.php?p="] > div > span:nth-child(4)',
        ).innerText
      : thread
          .querySelector<HTMLSpanElement>("div > div > a > span")
          .innerText.split(" - ")[0]
          .slice(1)

    threadsData.push({
      title: titleSpan.innerText,
      author,
      content: link.title, // preview of content when hovering link
      hide: () => {
        const threadRow = thread.parentElement
        threadRow.style.display = "none"
        const separator = threadRow.nextElementSibling as HTMLElement
        separator.style.display = "none"
      },
      changeColor: (color: string) => {
        titleSpan.style.color = color
      },
    })
  }

  return threadsData
}

/**
 * filter threads with any string present on list
 */
export function filterStrings() {
  const threads = loadThreads()

  function checkTitle(thread: Thread) {
    for (const str of settings.filteredStrings) {
      const title = thread.title.toLowerCase()

      if (
        title.includes(" " + str + " ") ||
        title.endsWith(" " + str) ||
        title.startsWith(str + " ")
      ) {
        thread.hide()
        log(`Hidden thread ${thread.title} because it contains "${str}"`)
        return
      }
    }
  }

  function checkAuthor(thread: Thread) {
    for (const ignoredUser of settings.ignoredUsers) {
      if (thread.author === ignoredUser) {
        thread.hide()
        log(
          `Hidden thread ${thread.title} because is authorized by "${ignoredUser}"`,
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

export async function tagThreads() {
  const threads = loadThreads()
  const threadTags = await tagger(threads)

  for (let i = 0; i < threads.length; i++) {
    if (threadTags[i] && threadTags[i] !== "otros") {
      const tag = settings.ai.tags.filter((t) => t.tagName == threadTags[i])[0]
      if (tag) {
        threads[i].changeColor(tag.color)
      }
    }
  }
}
