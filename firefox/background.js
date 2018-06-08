var default_options = {
  background: false
};

chrome.commands.onCommand.addListener(function(command) {
  if (command == "duplicate-tab") {
    chrome.storage.sync.get(default_options, function(options) {
      if (options.background) {
        // Open tab in background
        chrome.tabs.query({
          currentWindow: true,
          active: true,
        }, function(tabs) {
          var tab = tabs[0];
          chrome.tabs.create({
            active: false,
            index: tab.index+1,
            openerTabId: tab.id,
            url: tab.url
          });
        });
      }
      else {
        // Open tab in foreground
        chrome.tabs.query({
          currentWindow: true,
          active: true,
        }, function(tabs) {
          var tab = tabs[0];
          chrome.tabs.duplicate(tab.id);
        });
      }
    });
  }
});
