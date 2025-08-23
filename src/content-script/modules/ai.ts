function call(messages: ChatMessage[]): Promise<string> {
  return browser.runtime.sendMessage({
    action: "loadModelResponse",
    content: messages,
  })
}

export async function tagger(threads: Thread[]) {
  const prompt = settings.ai.prompt

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
  const threadTags = JSON.parse(response.trim())
  for (let i = 0; i < threads.length; i++) {
    // console.log(t)
    console.log(threads[i].title, " -> ", threadTags[i])
  }
}
