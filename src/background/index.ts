import type { RuntimeRequest } from "../shared/types"
import { generateCompletion, listModels, testConnection } from "./ai"

chrome.runtime.onMessage.addListener(
  (message: RuntimeRequest, _sender, sendResponse) => {
    if (!message || typeof message !== "object" || !("action" in message)) {
      return false
    }

    switch (message.action) {
      case "log":
        console.log("[Forocoching]", ...message.content)
        sendResponse({ ok: true })
        return false

      case "ai:generate":
        generateCompletion(message.messages, message.configOverride).then(
          sendResponse,
        )
        return true

      case "ai:test":
        testConnection(message.configOverride).then(sendResponse)
        return true

      case "ai:listModels":
        listModels(message.configOverride).then(sendResponse)
        return true

      default:
        return false
    }
  },
)

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage()
})
