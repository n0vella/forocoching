function call(messages: ChatMessage[]): Promise<string> {
  return chrome.runtime.sendMessage({
    action: "loadModelResponse",
    content: messages,
  })
}

async function tagsInCache(threadIds: number[]) {
  const threadsStateCache = (
    await chrome.storage.local.get({ threadsState: null })
  ).threadsState as number

  const threadState = threadIds.reduce((v, t, i) => t * i)

  if (threadState === threadsStateCache) {
    return true
  } else {
    chrome.storage.local.set({ threadsState: threadState })
    return false
  }
}

export async function tagger(threads: Thread[]) {
  if (await tagsInCache(threads.map((t) => t.id))) {
    const cachedTags = (
      await chrome.storage.local.get({ cachedTags: null })
    ).cachedTags as string[]

    if (cachedTags) {
      return cachedTags
    }
  }

  const tags = settings.ai.tags
    .map(({ tagName: name, description }) => `"${name}": ${description}`)
    .join("\n")
  const prompt = settings.ai.prompt.replace("{tags}", tags)

  const parsedThreads = threads
    .map(
      ({ title, content }) => `{
    "title": ${JSON.stringify(title)},
    "content": ${JSON.stringify(content)},
    "tag": ""
    }
  `,
    )
    .join(",\n")

  const response = await call([
    {
      role: "system",
      content: prompt,
    },
    {
      role: "user",
      content: "[" + parsedThreads + "]",
    },
  ])

  try {
    const match = response.match(/\[.+\]/s)

    if (!match) {
      console.error("Couldn't find expected array in response: ", response)
      return []
    }

    const tags = JSON.parse(match[0]).map(({ tag }: {tag: string}) => tag)

    chrome.storage.local.set({ cachedTags: tags })

    return tags
  } catch (e) {
    console.error("Error parsing model response: ", e)
    log("response body", response)
    return []
  }
}
