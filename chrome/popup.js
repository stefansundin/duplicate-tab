const default_options = {
  background: false,
};

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById(
    'extension-settings-link',
  ).href = `chrome://extensions/?id=${chrome.runtime.id}`;

  for (const link of document.getElementsByTagName('a')) {
    if (link.href.startsWith('chrome://')) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        chrome.tabs.create({ url: this.href });
      });
    }
  }

  const commands = await chrome.commands.getAll();
  for (const command of commands) {
    const shortcut = document.getElementById(`${command.name}-shortcut`);
    if (!shortcut) {
      continue;
    }
    shortcut.textContent = command.shortcut || 'not set';
  }

  const options = await chrome.storage.sync.get(default_options);
  const background = document.getElementById('background');
  background.checked = options.background;
  background.addEventListener('change', () =>
    chrome.storage.sync.set({
      background: background.checked,
    }),
  );

  if (!(await chrome.extension.isAllowedIncognitoAccess())) {
    document.getElementById('allow-in-incognito-notice').style.display =
      'inline';
  }
});
