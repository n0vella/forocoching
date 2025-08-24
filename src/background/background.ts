import OpenAI from "openai"
import { loadSettings } from "../utils"

async function callAIModel(messages: ChatMessage[]) {
  const settings = await loadSettings()

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

chrome.runtime.onMessage.addListener(function messageListener(
  message: Message,
  sender,
  sendResponse,
) {
  switch (message.action) {
    case "log":
      console.log(...message.content)
    case "loadModelResponse":
      Promise.resolve(callAIModel(message.content))
        .then(sendResponse)
        .catch((e) => sendResponse("Error: " + e))
      return true
  }
})

// open settigns in a new tab when click on extension icon
const openSettings = () =>
  chrome.tabs.create({
    url: chrome.runtime.getURL("dist/settings/settings.html"),
  })
chrome.action.onClicked.addListener(openSettings)
