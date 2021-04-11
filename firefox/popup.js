const default_options = {
  background: false,
};

document.addEventListener("DOMContentLoaded", function() {
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
      if (!result && background.checked) {
        background.indeterminate = true;
      }
    });

    background.addEventListener("change", function() {
      if (background.checked) {
        chrome.permissions.request({
          permissions: ["tabs"]
        }, function(granted) {
          if (granted) {
            const new_options = {
              background: true,
            };
            chrome.storage.sync.set(new_options);
          }
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
    background.checked = false;
    chrome.permissions.remove({
      permissions: ["tabs"]
    }, function(removed) {
      if (removed) {
        revoke.disabled = true;
        const new_options = {
          background: background.checked,
        };
        chrome.storage.sync.set(new_options);
      }
    });
  });

  browser.permissions.onAdded.addListener(function(permissions) {
    if (permissions.permissions.includes("tabs")) {
      revoke.disabled = false;
      if (background.indeterminate) {
        background.indeterminate = false;
      }
    }
  });

  browser.permissions.onRemoved.addListener(function(permissions) {
    if (permissions.permissions.includes("tabs")) {
      revoke.disabled = true;
      if (background.checked) {
        background.indeterminate = true;
      }
    }
  });
});
