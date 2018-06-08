var default_options = {
  background: false
};

document.addEventListener("DOMContentLoaded", function() {
  var links = document.getElementsByTagName("a");
  for (var i=0; i < links.length; i++) {
    var link = links[i];
    if (link.href.substr(0,9) == "chrome://") {
      link.addEventListener("click", function() {
        chrome.tabs.create({ url: this.href });
      });
    }
  }

  chrome.commands.getAll(function(commands) {
    commands.forEach(function(command) {
      var shortcut = document.getElementById(`${command.name}-shortcut`);
      if (!shortcut) return;
      shortcut.textContent = command.shortcut || "not set";
    });
  });

  var background = document.getElementById("background");
  chrome.storage.sync.get(default_options, function(options) {
    background.checked = options.background;
    if (options.background) {
      chrome.permissions.contains({
        permissions: ["tabs"]
      }, function(result) {
        if (!result) {
          background.checked = false;
        }
      });
    }
    background.addEventListener("change", function() {
      if (background.checked) {
        // requesting optional permissions will close the popup, so we'll have to delegate that to the background page
        chrome.runtime.sendMessage({ action: "request-tabs-permissions" });
      }
      else {
        var new_options = {
          background: background.checked
        };
        chrome.storage.sync.set(new_options);
      }
    });
  });
});
