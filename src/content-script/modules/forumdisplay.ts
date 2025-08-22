/**
 * returns id, title and content from threads
 */

type Thread = {
  id: string
  title: string
  author: string
  content: string
  hide: () => void
}

function loadThreads(): Thread[] {
  const threads = document.querySelectorAll<HTMLDivElement>(
    'div:has( > span > [id^="thread_title_"])',
  )

  const threadsData = []
  for (const thread of Array.from(threads)) {
    const link = thread.querySelector<HTMLSpanElement>("a")

    const titleSpan = link.querySelector<HTMLSpanElement>("span")
    const authorSpan = thread.querySelector<HTMLSpanElement>("div > a > span")

    threadsData.push({
      id: link.id,
      title: titleSpan.innerText,
      author: authorSpan.innerText.split(" - ")[0].slice(1),
      content: link.title, // preview of content when hovering link
      hide: () => {
        thread.parentElement.parentElement.style.display = "none"
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
      if (thread.title.toLowerCase().includes(str)) {
        thread.hide()
        log(`Hidden thread ${thread.title} for containing "${str}"`)
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
