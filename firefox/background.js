var default_options = {
  background: false
};

chrome.commands.onCommand.addListener(function(command) {
  if (command == "duplicate-tab") {
    chrome.tabs.query({
      currentWindow: true,
      active: true,
    }, function(tabs) {
      var tab = tabs[0];
      chrome.storage.sync.get(default_options, function(items) {
        chrome.tabs.create({
          active: !items.background,
          index: tab.index+1,
          openerTabId: tab.id,
          url: tab.url
        });
      });
    });
  }
});
