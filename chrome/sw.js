const default_options = {
  background: false,
};

chrome.commands.onCommand.addListener(async command => {
  if (command == 'duplicate-tab') {
    const options = await chrome.storage.sync.get(default_options);
    const tabs = await chrome.tabs.query({
      currentWindow: true,
      highlighted: true,
    });
    if (tabs.length === 1) {
      // Handle the simple case with a single tab separately
      const tab = tabs[0];
      await chrome.tabs.duplicate(tab.id);
      if (options.background) {
        // Focus the old tab
        await chrome.tabs.update(tab.id, { active: true });
      }
    } else {
      const pinnedTabs = tabs.filter(t => t.pinned);
      const lastPinnedTab = pinnedTabs[pinnedTabs.length - 1];
      const lastTab = tabs[tabs.length - 1];
      const newTabs = [];
      let pinnedIndex = 0;
      let index = 0;
      let tabToActivate;
      let tabToDeactivate;
      for (const tab of tabs) {
        const newTab = await chrome.tabs.duplicate(tab.id);
        newTabs.push(newTab);
        let newIndex;
        if (tab.pinned) {
          newIndex = lastPinnedTab.index + pinnedIndex + 1;
          pinnedIndex++;
        } else {
          newIndex = pinnedTabs.length + lastTab.index + index + 1;
          index++;
        }
        await chrome.tabs.move(newTab.id, { index: newIndex });
        if (tab.active) {
          tabToActivate = options.background ? tab : newTab;
        }
        if (options.background) {
          tabToDeactivate = newTab;
        }
      }
      for (const tab of options.background ? tabs : newTabs) {
        await chrome.tabs.update(tab.id, { highlighted: true });
      }
      if (tabToDeactivate) {
        await chrome.tabs.update(tabToDeactivate.id, { highlighted: false });
      }
      await chrome.tabs.update(tabToActivate.id, { highlighted: false });
      await chrome.tabs.update(tabToActivate.id, { highlighted: true });
    }
  } else if (command == 'duplicate-to-new-window') {
    const options = await chrome.storage.sync.get(default_options);
    const currentWindow = await chrome.windows.getCurrent();
    const tabs = await chrome.tabs.query({
      currentWindow: true,
      highlighted: true,
    });

    // Duplicate and move new tabs to a new window
    let newWindow;
    const newTabs = [];
    const tabsToActivate = [];
    for (const tab of tabs) {
      const newTab = await chrome.tabs.duplicate(tab.id);
      newTabs.push(newTab);
      if (newWindow) {
        await chrome.tabs.move(newTab.id, {
          windowId: newWindow.id,
          index: -1,
        });
      } else {
        newWindow = await chrome.windows.create({
          type: currentWindow.type,
          incognito: currentWindow.incognito,
          tabId: newTab.id, // This removes the tab from the old window
          focused: !options.background,
        });
      }
      if (tab.pinned) {
        await chrome.tabs.update(newTab.id, { pinned: true });
      }
      if (tab.active) {
        tabsToActivate.push(tab);
        tabsToActivate.push(newTab);
      }
    }

    // Highlight tabs
    for (const tab of tabs) {
      await chrome.tabs.update(tab.id, { highlighted: true });
    }
    for (const tab of newTabs) {
      await chrome.tabs.update(tab.id, { highlighted: true });
    }
    for (const tabToActivate of tabsToActivate) {
      await chrome.tabs.update(tabToActivate.id, { highlighted: false });
      await chrome.tabs.update(tabToActivate.id, { highlighted: true });
    }
  } else if (command == 'pop-out-to-new-window') {
    const options = await chrome.storage.sync.get(default_options);
    const currentWindow = await chrome.windows.getCurrent();
    const tabs = await chrome.tabs.query({
      currentWindow: true,
      highlighted: true,
    });
    const activeTab = tabs.find(t => t.active);

    // Move tabs to a new window
    let newWindow;
    for (const tab of tabs) {
      if (newWindow) {
        await chrome.tabs.move(tab.id, {
          windowId: newWindow.id,
          index: -1,
        });
      } else {
        newWindow = await chrome.windows.create({
          type: currentWindow.type,
          incognito: currentWindow.incognito,
          tabId: tab.id, // This removes the tab from the old window
          focused: !options.background,
        });
      }
      if (tab.pinned) {
        await chrome.tabs.update(tab.id, { pinned: true });
      }
    }

    // Highlight tabs
    for (const tab of tabs) {
      await chrome.tabs.update(tab.id, { highlighted: true });
    }
    await chrome.tabs.update(activeTab.id, { highlighted: false });
    await chrome.tabs.update(activeTab.id, { highlighted: true });
  } else if (command == 'new-tab-to-the-right') {
    const [tab] = await chrome.tabs.query({
      currentWindow: true,
      active: true,
    });
    const newTab = await chrome.tabs.create({
      active: true,
      pinned: tab.pinned,
      index: tab.index + 1,
      openerTabId: tab.id,
    });
    if (tab.groupId !== -1 && newTab.groupId === -1) {
      // This is only needed when performing the action on the right-most tab of a group
      // When used on other tabs in the group, the new tab is automatically grouped
      chrome.tabs.group({
        groupId: tab.groupId,
        tabIds: [newTab.id],
      });
    }
  }
});
