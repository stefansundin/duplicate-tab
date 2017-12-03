var default_options = {
  background: false
};

document.addEventListener("DOMContentLoaded", function() {
  chrome.commands.getAll(function(commands) {
    commands.forEach(function(command) {
      if (command.name == "duplicate-tab") {
        var shortcut = document.getElementById("shortcut");
        shortcut.textContent = command.shortcut || "not set";
      }
    });
  });

  var background = document.getElementById("background");
  chrome.storage.sync.get(default_options, function(items) {
    background.checked = items.background;
    background.addEventListener("change", function() {
      var new_options = {
        background: background.checked
      };
      chrome.storage.sync.set(new_options);
    });
  });
});
