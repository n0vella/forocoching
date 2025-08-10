/**
 * returns id, title and content from threads
 */

type Thread = { id: string; title: string; content: string; hide: () => void }

function loadThreads(): Thread[] {
  const threads = document.querySelectorAll<HTMLDivElement>(
    'div:has(div > span > [id^="thread_title_"])',
  )

  const threadsData = []
  for (const thread of Array.from(threads)) {
    const link = thread.querySelector<HTMLSpanElement>("a")

    const titleSpan = link.querySelector<HTMLSpanElement>("span")

    threadsData.push({
      id: link.id,
      title: titleSpan.innerText,
      content: link.title, // preview of content when hovering link
      hide: () => {
        thread.style.display = "hidden"
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

  for (const thread of threads) {
    checkTitle(thread)
  }
}
