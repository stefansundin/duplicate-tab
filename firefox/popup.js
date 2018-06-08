var default_options = {
  background: false
};

function refresh_shortcuts() {
  chrome.commands.getAll(function(commands) {
    commands.forEach(function(command) {
      var shortcut = document.getElementById(`${command.name}-shortcut`);
      if (!shortcut) return;
      shortcut.value = command.shortcut || "";
    });
  });
}

document.addEventListener("DOMContentLoaded", function() {
  refresh_shortcuts();

  var save = document.getElementById("save");
  save.addEventListener("click", async function() {
    document.getElementById("error").innerText = "";
    try {
      var all_commands = ["duplicate-tab", "duplicate-to-new-window"];
      for (var i=0; i < all_commands.length; i++) {
        var command = all_commands[i];
        var shortcut = document.getElementById(`${command}-shortcut`);
        if (!shortcut) continue;
        if (shortcut.value == "") {
          await browser.commands.reset(command);
        }
        else {
          await browser.commands.update({
            name: command,
            shortcut: shortcut.value
          });
        }
      }
      refresh_shortcuts();
    } catch (e) {
      document.getElementById("error").innerText = e.toString();
    }
  });

  var background = document.getElementById("background");
  chrome.storage.sync.get(default_options, function(options) {
    background.checked = options.background;
    background.addEventListener("change", function() {
      var new_options = {
        background: background.checked
      };
      chrome.storage.sync.set(new_options);
    });
  });
});
