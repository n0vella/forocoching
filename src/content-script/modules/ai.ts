function call(messages: ChatMessage[]): Promise<string> {
  return browser.runtime.sendMessage({
    action: "loadModelResponse",
    content: messages,
  })
}

export async function tagger(threads: Thread[]) {
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

    if (match.length === 0) {
      console.error("Couldn't find expected array in response: ", response)
      return []
    }

    return JSON.parse(match[0]).map(({ tag }) => tag)
  } catch {
    console.error("Error parsing model response: ", response)
    return []
  }
}
