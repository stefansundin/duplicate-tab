var default_options = {
  background: false
};

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    if (message.action == "request-tabs-permissions") {
      chrome.permissions.request({
        permissions: ["tabs"]
      }, function(granted) {
        if (granted) {
          var new_options = {
            background: true
          };
          chrome.storage.sync.set(new_options);
        }
      });
    }
  }
);

chrome.commands.onCommand.addListener(function(command) {
  if (command == "duplicate-tab") {
    chrome.storage.sync.get(default_options, function(options) {
      if (options.background) {
        // Open tab in background, make sure we have the required permissions
        chrome.permissions.request({
          permissions: ["tabs"]
        }, function(granted) {
          chrome.tabs.query({
            currentWindow: true,
            active: true,
          }, function(tabs) {
            var tab = tabs[0];
            if (granted) {
              // Permissions were granted
              chrome.tabs.create({
                active: false,
                index: tab.index+1,
                openerTabId: tab.id,
                url: tab.url
              });
            }
            else {
              // Permissions were not granted, so just open the tab with the duplicate function
              chrome.tabs.duplicate(tab.id);
            }
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
  else if (command == "duplicate-to-new-window") {
    // we need tabs permission to get access to tab.url
    chrome.permissions.request({
      permissions: ["tabs"]
    }, function(granted) {
      if (granted) {
        chrome.tabs.query({
          currentWindow: true,
          active: true,
        }, function(tabs) {
          var tab = tabs[0];
          chrome.windows.create({
            url: tab.url,
          });
        });
      }
    });
  }
});
