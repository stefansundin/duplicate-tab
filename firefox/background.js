chrome.commands.getAll(function(commands) {
  commands.forEach(function(command) {
    console.log(command);
  });
});

chrome.commands.onCommand.addListener(function(command) {
  if (command == "duplicate-tab") {
    console.log("Duplicating tab..");
    chrome.tabs.query({
      currentWindow: true,
      active: true,
    }, function(tabs) {
      var tab = tabs[0]
      console.log(tab);
      chrome.tabs.duplicate(tab.id);
    });
  }
});
