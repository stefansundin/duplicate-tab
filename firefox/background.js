const default_options = {
  background: false,
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
          const tab = tabs[0];
          chrome.tabs.create({
            active: false,
            index: tab.index+1,
            openerTabId: tab.id,
            url: tab.url,
          });
        });
      }
      else {
        // Open tab in foreground
        chrome.tabs.query({
          currentWindow: true,
          active: true,
        }, function(tabs) {
          const tab = tabs[0];
          chrome.tabs.duplicate(tab.id);
        });
      }
    });
  }
  else if (command == "duplicate-to-new-window") {
    chrome.tabs.query({
      currentWindow: true,
      active: true,
    }, function(tabs) {
      const tab = tabs[0];
      chrome.windows.create({
        url: tab.url,
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
      const tab = tabs[0];
      chrome.tabs.create({
        active: true,
        index: tab.index+1,
        openerTabId: tab.id,
      });
    });
  }
});
