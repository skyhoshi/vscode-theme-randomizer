const COMMAND_RANDOMIZE_THEME = 'vscodeThemeRandomizer.randomizeTheme';
const COMMAND_RESET_THEME = 'vscodeThemeRandomizer.resetToDefaultTheme';
const COMMAND_SELECT_DEFAULT_THEME = 'vscodeThemeRandomizer.selectDefaultTheme';
const CONFIG_SECTION = 'vscodeThemeRandomizer';
const CONFIG_RANDOMIZE_ON_STARTUP = 'randomizeOnStartup';
const CONFIG_DEFAULT_THEME = 'defaultTheme';
const CONFIG_THEME_TYPE = 'themeType';

function createExtensionApi(vscode, options = {}) {
  const random = typeof options.random === 'function' ? options.random : Math.random;

  function getInstalledThemes() {
    const themesByLabel = new Map();

    for (const extension of vscode.extensions.all) {
      const themes = extension?.packageJSON?.contributes?.themes;
      if (!Array.isArray(themes)) {
        continue;
      }

      for (const theme of themes) {
        if (theme && typeof theme.label === 'string' && theme.label.trim().length > 0) {
          themesByLabel.set(theme.label, { label: theme.label, type: theme.uiTheme });
        }
      }
    }

    return [...themesByLabel.values()];
  }

  function getInstalledThemeLabels() {
    return getInstalledThemes().map((theme) => theme.label);
  }

  async function randomizeTheme() {
    const configuration = vscode.workspace.getConfiguration('workbench');
    const currentTheme = configuration.get('colorTheme');

    const installedThemes = getInstalledThemes();
    if (installedThemes.length === 0) {
      void vscode.window.showWarningMessage('No installed color themes were found.');
      return;
    }

    const extensionConfiguration = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const storedDefaultTheme = extensionConfiguration.get(CONFIG_DEFAULT_THEME, '');
    const themeType = extensionConfiguration.get(CONFIG_THEME_TYPE, 'vs-dark');
    const flashbombPreventionEnabled = extensionConfiguration.get('flashbombPrevention', true);

    // Capture the theme that was active before the first randomization.
    if (!storedDefaultTheme && typeof currentTheme === 'string' && currentTheme.length > 0) {
      await extensionConfiguration.update(CONFIG_DEFAULT_THEME, currentTheme, vscode.ConfigurationTarget.Global, );
    }

    const themesOfRequestedType = themeType === 'vs-dark'
      ? installedThemes
      : installedThemes.filter((theme) => theme.type === themeType);

    if (themesOfRequestedType.length === 0) {
      void vscode.window.showWarningMessage(`No installed ${themeType} color themes were found.`);
      return;
    }

    const candidateThemes = themesOfRequestedType.filter((theme) => theme.label !== currentTheme);
    const pool = candidateThemes.length > 0 ? candidateThemes : themesOfRequestedType;
    const randomTheme = pool[Math.floor(random() * pool.length)].label;

    await configuration.update('colorTheme', randomTheme, vscode.ConfigurationTarget.Global);
  }

  async function selectDefaultTheme() {
    const installedThemes = getInstalledThemes();
    if (installedThemes.length === 0) {
      void vscode.window.showWarningMessage('No installed color themes were found.');
      return;
    }

    const selectedTheme = await vscode.window.showQuickPick(
      installedThemes.map((theme) => ({
        label: theme.label,
        description: theme.type || 'system defined',
      })),
      { placeHolder: 'Select the theme to restore' },
    );

    if (selectedTheme) {
      await vscode.workspace
        .getConfiguration(CONFIG_SECTION)
        .update(CONFIG_DEFAULT_THEME, selectedTheme.label, vscode.ConfigurationTarget.Global);
    }
  }

  async function resetToDefaultTheme() {
    const defaultTheme = vscode.workspace.getConfiguration(CONFIG_SECTION).get(CONFIG_DEFAULT_THEME, '');

    if (!defaultTheme) {
      void vscode.window.showWarningMessage('No default color theme has been stored yet.');
      return;
    }

    await vscode.workspace
      .getConfiguration('workbench')
      .update('colorTheme', defaultTheme, vscode.ConfigurationTarget.Global);
  }

  function activate(context) {
    const randomizeCommand = vscode.commands.registerCommand(COMMAND_RANDOMIZE_THEME, randomizeTheme);
    const resetCommand = vscode.commands.registerCommand(COMMAND_RESET_THEME, resetToDefaultTheme);
    const selectDefaultThemeCommand = vscode.commands.registerCommand(
      COMMAND_SELECT_DEFAULT_THEME,
      selectDefaultTheme,
    );
    context.subscriptions.push(randomizeCommand, resetCommand, selectDefaultThemeCommand);

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
    resetToDefaultTheme,
    selectDefaultTheme,
  };
}

module.exports = {
  createExtensionApi,
};
