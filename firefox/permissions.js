document.addEventListener("DOMContentLoaded", function() {
  const grant = document.getElementById("grant");

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
});
