const COMMAND_RANDOMIZE_THEME = 'vscodeThemeRandomizer.randomizeTheme';
const CONFIG_SECTION = 'vscodeThemeRandomizer';
const CONFIG_RANDOMIZE_ON_STARTUP = 'randomizeOnStartup';

function createExtensionApi(vscode, options = {}) {
  const random = typeof options.random === 'function' ? options.random : Math.random;

  function getInstalledThemeLabels() {
    const labels = new Set();

    for (const extension of vscode.extensions.all) {
      const themes = extension?.packageJSON?.contributes?.themes;
      if (!Array.isArray(themes)) {
        continue;
      }

      for (const theme of themes) {
        if (theme && typeof theme.label === 'string' && theme.label.trim().length > 0) {
          labels.add(theme.label);
        }
      }
    }

    return [...labels];
  }

  async function randomizeTheme() {
    const configuration = vscode.workspace.getConfiguration('workbench');
    const currentTheme = configuration.get('colorTheme');

    const themeLabels = getInstalledThemeLabels();
    if (themeLabels.length === 0) {
      void vscode.window.showWarningMessage('No installed color themes were found.');
      return;
    }

    const candidateThemes = themeLabels.filter((theme) => theme !== currentTheme);
    const pool = candidateThemes.length > 0 ? candidateThemes : themeLabels;
    const randomTheme = pool[Math.floor(random() * pool.length)];

    await configuration.update('colorTheme', randomTheme, vscode.ConfigurationTarget.Global);
  }

  function activate(context) {
    const randomizeCommand = vscode.commands.registerCommand(COMMAND_RANDOMIZE_THEME, randomizeTheme);
    context.subscriptions.push(randomizeCommand);

    const shouldRandomizeOnStartup = vscode.workspace
      .getConfiguration(CONFIG_SECTION)
      .get(CONFIG_RANDOMIZE_ON_STARTUP, false);

    if (shouldRandomizeOnStartup && context.extensionMode !== vscode.ExtensionMode.Test) {
      void randomizeTheme();
    }
  }

  function deactivate() {}

  return {
    activate,
    deactivate,
    getInstalledThemeLabels,
    randomizeTheme,
  };
}

module.exports = {
  createExtensionApi,
};
