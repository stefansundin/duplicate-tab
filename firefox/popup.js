const default_options = {
  background: false,
};

document.addEventListener('DOMContentLoaded', async () => {
  for (const link of document.getElementsByTagName('a')) {
    if (link.href === 'chrome://extensions/shortcuts') {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        browser.commands.openShortcutSettings().then(() => window.close()).catch(console.error);
      });
    }
  }

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
});
