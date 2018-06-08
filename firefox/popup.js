var default_options = {
  background: false
};

document.addEventListener("DOMContentLoaded", function() {
  var shortcut = document.getElementById("shortcut");
  chrome.commands.getAll(function(commands) {
    commands.forEach(function(command) {
      if (command.name == "duplicate-tab") {
        shortcut.value = command.shortcut;
      }
    });
  });

  var save = document.getElementById("shortcut");
  save.addEventListener("change", async function() {
    document.getElementById("error").innerText = "";
    try {
      await browser.commands.update({
        name: "duplicate-tab",
        shortcut: shortcut.value
      });
    } catch (e) {
      document.getElementById("error").innerText = e.toString();
    }
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
