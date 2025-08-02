browser.runtime.onMessage.addListener(function messageListener(
  message: Message,
) {
  switch (message.action) {
    case "log":
      console.log(...message.content)
  }
})

// open settigns in a new tab when click on extension icon
const openSettings = () =>
  browser.tabs.create({
    url: browser.runtime.getURL("dist/settings/settings.html"),
  })
browser.action.onClicked.addListener(openSettings)
