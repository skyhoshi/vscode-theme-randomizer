const { createExtensionApi } = require('./themeRandomizer');

function activate(context) {
  // eslint-disable-next-line global-require
  const vscode = require('vscode');
  createExtensionApi(vscode).activate(context);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
