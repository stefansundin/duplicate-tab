chrome.commands.onCommand.addListener(function(command) {
  if (command == "duplicate-tab") {
    chrome.tabs.query({
      currentWindow: true,
      active: true,
    }, function(tabs) {
      var tab = tabs[0]
      chrome.tabs.duplicate(tab.id);
    });
  }
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId == "duplicate-tab") {
    chrome.tabs.duplicate(tab.id);
  }
})

chrome.contextMenus.create({
  id: "duplicate-tab",
  title: "Duplicate",
  contexts: ["tab"],
});
