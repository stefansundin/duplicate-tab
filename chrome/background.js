chrome.commands.onCommand.addListener(function(command) {
  if (command == "duplicate-tab") {
    chrome.tabs.query({
      currentWindow: true,
      active: true,
    }, function(tabs) {
      var tab = tabs[0];
      chrome.tabs.duplicate(tab.id);
    });
  }
});
