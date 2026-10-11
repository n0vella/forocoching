import { generateAIResponse, describeError, listModels } from "browser-extension-ai"
import { loadSettings } from "../utils"

async function callAIModel(messages: ChatMessage[]) {
  const settings = await loadSettings()
  const hasSystem = messages[0]?.role === "system"
  return await generateAIResponse({
    endpoint: settings.ai.endpoint,
    apiKey: settings.ai.apiKey,
    model: settings.ai.model,
    instructions: hasSystem ? messages[0].content : undefined,
    messages: messages,
  })
}

chrome.runtime.onMessage.addListener(function messageListener(
  message: Message,
  sender,
  sendResponse,
) {
  switch (message.action) {
    case "log":
      console.log(...message.content)
      break
    case "loadModelResponse":
      Promise.resolve(callAIModel(message.content))
        .then(sendResponse)
        .catch((e) => sendResponse("Error: " + describeError(e)))
      return true
    case "listModels":
      Promise.resolve(listModels(message.content.endpoint, message.content.apiKey))
        .then(sendResponse)
        .catch((e) => sendResponse({ error: "Error: " + describeError(e) }))
      return true
  }
})

// open settings in a new tab when click on extension icon
const openSettings = () =>
  chrome.tabs.create({
    url: chrome.runtime.getURL("dist/settings/settings.html"),
  })
chrome.action.onClicked.addListener(openSettings)
