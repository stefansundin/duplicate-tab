const default_options = {
  background: false,
};

document.addEventListener("DOMContentLoaded", function() {
  const links = document.getElementsByTagName("a");
  for (let i=0; i < links.length; i++) {
    const link = links[i];
    if (link.href.substr(0,9) == "chrome://") {
      link.addEventListener("click", function() {
        chrome.tabs.create({ url: this.href });
      });
    }
  }

  chrome.commands.getAll(function(commands) {
    commands.forEach(function(command) {
      const shortcut = document.getElementById(`${command.name}-shortcut`);
      if (!shortcut) return;
      shortcut.textContent = command.shortcut || "not set";
    });
  });

  const background = document.getElementById("background");
  const revoke = document.getElementById("revoke");

  chrome.storage.sync.get(default_options, function(options) {
    background.checked = options.background;

    chrome.permissions.contains({
      permissions: ["tabs"]
    }, function(result) {
      revoke.disabled = !result;
      if (!result) {
        background.checked = false;
      }
    });

    background.addEventListener("change", function() {
      if (background.checked) {
        // requesting optional permissions will close the popup, so we'll have to delegate that to the background page
        chrome.runtime.sendMessage({ action: "request-tabs-permissions" }, null, function(granted) {
          revoke.disabled = !granted;
          background.checked = granted;
        });
      }
      else {
        const new_options = {
          background: background.checked,
        };
        chrome.storage.sync.set(new_options);
      }
    });
  });

  revoke.addEventListener("click", function() {
    chrome.permissions.remove({
      permissions: ["tabs"]
    }, function(removed) {
      if (removed) {
        revoke.disabled = true;
        background.checked = false;
        const new_options = {
          background: background.checked,
        };
        chrome.storage.sync.set(new_options);
      }
    });
  });
});
