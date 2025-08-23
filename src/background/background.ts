import "webextension-polyfill"
import OpenAI from "openai"
import { loadSettings } from "../utils"

async function callAIModel(messages: ChatMessage[]) {
  await loadSettings()
  console.log(settings)

  const client = new OpenAI({
    baseURL: settings.ai.endpoint,
    apiKey: settings.ai.apiKey,
    dangerouslyAllowBrowser: true,
  })

  const response = await client.chat.completions.create({
    model: settings.ai.model,
    messages,
  })

  return response.choices[0].message.content
}

browser.runtime.onMessage.addListener(function messageListener(
  message: Message,
  sender,
  sendResponse,
) {
  switch (message.action) {
    case "log":
      console.log(...message.content)
    case "loadModelResponse":
      sendResponse(callAIModel(message.content))
      return true
  }
})

// open settigns in a new tab when click on extension icon
const openSettings = () =>
  browser.tabs.create({
    url: browser.runtime.getURL("dist/settings/settings.html"),
  })
browser.action.onClicked.addListener(openSettings)
