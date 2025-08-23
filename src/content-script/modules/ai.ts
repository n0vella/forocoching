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
      ({ title, content }) => `
    Título: ${title}
    Contenido:
    ${content}
    ---
  `,
    )
    .join("\n")

  const response = await call([
    {
      role: "system",
      content: prompt,
    },
    {
      role: "user",
      content: parsedThreads,
    },
    {
      role: "assistant",
      content: `[
      "`,
    },
  ])
  try {
    return JSON.parse(response.trim())
  } catch {
    console.error("Error parsing model response: ", response.trim())
  }
}
