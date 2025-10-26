const default_options = {
  background: false,
};

async function updateShortcutText() {
  const commands = await browser.commands.getAll();
  for (const command of commands) {
    const shortcut = document.getElementById(`${command.name}-shortcut`);
    if (!shortcut) {
      continue;
    }
    shortcut.textContent = command.shortcut || 'not set';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  for (const link of document.querySelectorAll('a[data-href="shortcuts"]')) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      browser.commands.openShortcutSettings().then(() => window.close()).catch(console.error);
    });
  }

  browser.commands.onChanged.addListener(() => updateShortcutText());
  await updateShortcutText();

  const options = await browser.storage.sync.get(default_options);
  const background = document.getElementById('background');
  background.checked = options.background;
  background.addEventListener('change', () =>
    browser.storage.sync.set({
      background: background.checked,
    }),
  );
});
