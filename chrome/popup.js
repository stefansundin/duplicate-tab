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
      if (command.name == "duplicate-tab") {
        var shortcut = document.getElementById("shortcut");
        shortcut.innerText = command.shortcut || "not set";
      }
    });
  });
});
