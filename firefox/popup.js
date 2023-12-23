const default_options = {
  background: false,
};

document.addEventListener('DOMContentLoaded', async () => {
  const commands = await browser.commands.getAll();
  for (const command of commands) {
    const shortcut = document.getElementById(`${command.name}-shortcut`);
    if (!shortcut) {
      continue;
    }
    shortcut.textContent = command.shortcut || 'not set';
  }

  const options = await browser.storage.sync.get(default_options);
  const background = document.getElementById('background');
  background.checked = options.background;
  background.addEventListener('change', () =>
    browser.storage.sync.set({
      background: background.checked,
    }),
  );

  if (await browser.extension.isAllowedIncognitoAccess()) {
    document.getElementById('allow-in-incognito-notice').style.display = 'none';
  }
});
