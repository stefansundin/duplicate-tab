var default_options = {
  background: false,
};

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    if (message.action == "request-tabs-permissions") {
      chrome.permissions.request({
        permissions: ["tabs"]
      }, function(granted) {
        if (granted) {
          var new_options = {
            background: true,
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
                url: tab.url,
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
      if (!granted) {
        return;
      }
      chrome.tabs.query({
        currentWindow: true,
        active: true,
      }, function(tabs) {
        var tab = tabs[0];
        chrome.windows.create({
          url: tab.url,
        });
      });
    });
  }
  else if (command == "pop-out-to-new-window") {
    (async () => {
      const currentWindow = await new Promise((resolve) => {
        chrome.windows.getCurrent((wnd) => {
          resolve(wnd);
        });
      });
      const tabs = await new Promise((resolve) => {
        chrome.tabs.query({
          currentWindow: true,
          highlighted: true,
        }, (tabs) => {
          resolve(tabs);
        })
      });

      // Cherrypick the options we want to clone
      const windowOpts = {
        type: currentWindow.type,
        incognito: currentWindow.incognito,
        tabId: tabs[0].id, // this removes the tab from the old window
        focused: true,
      }

      // Can't set dimensions and position for some states
      if (["minimized", "maximized", "fullscreen"].includes(currentWindow.state)) {
        windowOpts.state = currentWindow.state;
      }
      else {
        windowOpts.top = currentWindow.top;
        windowOpts.left = currentWindow.left;
        windowOpts.height = currentWindow.height;
        windowOpts.width = currentWindow.width;
      }

      chrome.windows.create(windowOpts, function(newWindow) {
        chrome.tabs.move(tabs.slice(1).map((t) => t.id), {
          windowId: newWindow.id,
          index: -1,
        });
        tabs.filter((t) => t.pinned).forEach((t) => {
          chrome.tabs.update(t.id, { pinned: true });
        });
        chrome.tabs.update(tabs.find((t) => t.active).id, { active: true });
      });
    })();
  }
  else if (command == "new-tab-to-the-right") {
    chrome.tabs.query({
      currentWindow: true,
      active: true,
    }, function(tabs) {
      var tab = tabs[0];
      chrome.tabs.create({
        active: true,
        index: tab.index+1,
        openerTabId: tab.id,
      });
    });
  }
});
