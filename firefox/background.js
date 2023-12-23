const default_options = {
  background: false,
};

browser.commands.onCommand.addListener(async command => {
  if (command == 'duplicate-tab') {
    const options = await browser.storage.sync.get(default_options);
    const tabs = await browser.tabs.query({
      currentWindow: true,
      highlighted: true,
    });
    if (tabs.length === 1) {
      // Handle the simple case with a single tab separately
      const tab = tabs[0];
      const newTab = await browser.tabs.duplicate(tab.id);
      if (tab.pinned) {
        // Firefox only:
        await browser.tabs.update(newTab.id, { pinned: true });
        await browser.tabs.move(newTab.id, { index: tab.index + 1 });
      }
      if (options.background) {
        // Focus the old tab
        await browser.tabs.update(tab.id, { active: true });
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
        const newTab = await browser.tabs.duplicate(tab.id);
        newTabs.push(newTab);
        let newIndex;
        if (tab.pinned) {
          await browser.tabs.update(newTab.id, { pinned: true }); // Firefox only
          newIndex = lastPinnedTab.index + pinnedIndex + 1;
          pinnedIndex++;
        } else {
          newIndex = pinnedTabs.length + lastTab.index + index + 1;
          index++;
        }
        await browser.tabs.move(newTab.id, { index: newIndex });
        if (tab.active) {
          tabToActivate = options.background ? tab : newTab;
        }
        if (options.background) {
          tabToDeactivate = newTab;
        }
      }
      for (const tab of options.background ? tabs : newTabs) {
        await browser.tabs.update(tab.id, { highlighted: true });
      }
      if (tabToDeactivate) {
        await browser.tabs.update(tabToDeactivate.id, { highlighted: false });
      }
      await browser.tabs.update(tabToActivate.id, { highlighted: false });
      await browser.tabs.update(tabToActivate.id, { highlighted: true });
    }
  } else if (command == 'duplicate-to-new-window') {
    const options = await browser.storage.sync.get(default_options);
    const currentWindow = await browser.windows.getCurrent();
    const tabs = await browser.tabs.query({
      currentWindow: true,
      highlighted: true,
    });

    // Duplicate and move new tabs to a new window
    let newWindow;
    const newTabs = [];
    const tabsToActivate = [];
    for (const tab of tabs) {
      const newTab = await browser.tabs.duplicate(tab.id);
      newTabs.push(newTab);
      if (newWindow) {
        await browser.tabs.move(newTab.id, {
          windowId: newWindow.id,
          index: -1,
        });
      } else {
        newWindow = await browser.windows.create({
          type: currentWindow.type,
          incognito: currentWindow.incognito,
          tabId: newTab.id, // This removes the tab from the old window
          focused: !options.background,
        });
        if (options.background) {
          // Firefox bug: doesn't respect the "focused: false" attribute in browser.windows.create, so manually focus the old window again
          await browser.windows.update(currentWindow.id, {
            focused: true,
          });
        }
      }
      if (tab.pinned) {
        await browser.tabs.update(newTab.id, { pinned: true });
      }
      if (tab.active) {
        tabsToActivate.push(tab);
        tabsToActivate.push(newTab);
      }
    }

    // Highlight tabs
    for (const tab of tabs) {
      await browser.tabs.update(tab.id, { highlighted: true });
    }
    for (const tab of newTabs) {
      await browser.tabs.update(tab.id, { highlighted: true });
    }
    for (const tabToActivate of tabsToActivate) {
      await browser.tabs.update(tabToActivate.id, { highlighted: false });
      await browser.tabs.update(tabToActivate.id, { highlighted: true });
    }
  } else if (command == 'pop-out-to-new-window') {
    const options = await browser.storage.sync.get(default_options);
    const currentWindow = await browser.windows.getCurrent();
    const tabs = await browser.tabs.query({
      currentWindow: true,
      highlighted: true,
    });
    const activeTab = tabs.find(t => t.active);

    // Move tabs to a new window
    let newWindow;
    for (const tab of tabs) {
      if (newWindow) {
        await browser.tabs.move(tab.id, {
          windowId: newWindow.id,
          index: -1,
        });
      } else {
        newWindow = await browser.windows.create({
          type: currentWindow.type,
          incognito: currentWindow.incognito,
          tabId: tab.id, // This removes the tab from the old window
          focused: !options.background,
        });
        if (options.background) {
          // Firefox bug: doesn't respect the "focused: false" attribute in browser.windows.create, so manually focus the old window again
          await browser.windows.update(currentWindow.id, {
            focused: true,
          });
        }
      }
      if (tab.pinned) {
        await browser.tabs.update(tab.id, { pinned: true });
      }
    }

    // Highlight tabs
    for (const tab of tabs) {
      await browser.tabs.update(tab.id, { highlighted: true });
    }
    await browser.tabs.update(activeTab.id, { active: true });
  } else if (command == 'pop-out-to-new-incognito-window') {
    const options = await browser.storage.sync.get(default_options);
    const currentWindow = await browser.windows.getCurrent();
    const tabs = await browser.tabs.query({
      currentWindow: true,
      highlighted: true,
    });
    const activeTabIndex = tabs.findIndex(t => t.active);

    // Create an incognito window with the tab URLs and then try to restore the state properly
    // If the window is already an incognito window then it creates a non-incognito window
    // This obviously does not preserve tab history
    const newWindow = await browser.windows.create({
      type: currentWindow.type,
      incognito: !currentWindow.incognito,
      url: tabs.map(t => t.url),
      focused: !options.background,
    });
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].pinned) {
        await browser.tabs.update(newWindow.tabs[i].id, { pinned: true });
      }
    }
    await browser.tabs.update(newWindow.tabs[activeTabIndex].id, {
      active: true,
    });

    // Close the original tabs
    await browser.tabs.remove(tabs.map(t => t.id));
  } else if (command == 'new-tab-to-the-right') {
    const [tab] = await browser.tabs.query({
      currentWindow: true,
      active: true,
    });
    const newTab = await browser.tabs.create({
      active: true,
      pinned: tab.pinned,
      index: tab.index + 1,
      openerTabId: tab.id,
    });
    if (tab.groupId !== -1 && newTab.groupId === -1) {
      // This is only needed when performing the action on the right-most tab of a group
      // When used on other tabs in the group, the new tab is automatically grouped
      browser.tabs.group({
        groupId: tab.groupId,
        tabIds: [newTab.id],
      });
    }
  }
});
