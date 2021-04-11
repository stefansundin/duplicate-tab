const default_options = {
  background: false,
};

document.addEventListener("DOMContentLoaded", function() {
  const grant = document.getElementById("grant");
  const disable_background = document.getElementById("disable_background");

  chrome.permissions.contains({
    permissions: ["tabs"]
  }, function(granted) {
    if (granted) {
      grant.disabled = true;
      grant.textContent = "Permissions granted";
    }
  });

  grant.addEventListener("click", function() {
    chrome.permissions.request({
      permissions: ["tabs"]
    }, function(granted) {
      if (granted) {
        grant.disabled = true;
        grant.textContent = "Permissions granted";
      }
    });
  });

  chrome.storage.sync.get(default_options, function(options) {
    disable_background.disabled = !options.background;
  });

  disable_background.addEventListener("click", function() {
    const new_options = {
      background: false,
    };
    chrome.storage.sync.set(new_options);
    this.disabled = true;
  });
});
