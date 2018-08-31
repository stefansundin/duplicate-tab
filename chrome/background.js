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
        sendResponse(granted);
      });
      return true;
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
  else if (command == "move-to-new-window") {
    chrome.permissions.request({
      permissions: ["tabs"]
    }, function(granted) {
      if (granted) {
        (() => {
          const _currentTab = new Promise((resolve) => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
              resolve(tabs[0])
            })
          });

          const _currentWindow = new Promise((resolve) => {
            chrome.windows.getCurrent((win) => resolve(win))
          });

          (async () => {
            const currentTab = await _currentTab
            const currentWindow = await _currentWindow

            // Let's cherrypick the options we want to clone
            const windowOpts = {
              tabId: currentTab.id,
              focused: true,
              incognito: currentWindow.incognito,
              type: currentWindow.type
            }

            // Cant set dimensions and pos manually for some states
            if(['minimized', 'maximized', 'fullscreen'].indexOf(currentWindow.state) !== -1)
            {
              windowOpts.state = currentWindow.state
            }
            else {
              windowOpts.top = currentWindow.top
              windowOpts.left = currentWindow.left
              windowOpts.height = currentWindow.height
              windowOpts.width = currentWindow.width
            }

            chrome.windows.create(windowOpts)
          })();

        })();
      }
    });
  }
});
