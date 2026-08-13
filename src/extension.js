const { createExtensionApi } = require('./themeRandomizer');

let defaultApi;

function getDefaultApi() {
  if (!defaultApi) {
    // Loaded lazily so tests can import this file without VS Code runtime.
    // eslint-disable-next-line global-require
    const vscode = require('vscode');
    defaultApi = createExtensionApi(vscode);
  }

  return defaultApi;
}

function activate(context) {
  return getDefaultApi().activate(context);
}

function deactivate() {
  return getDefaultApi().deactivate();
}

module.exports = {
  activate,
  deactivate,
};
