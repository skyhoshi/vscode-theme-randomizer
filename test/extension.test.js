const test = require('node:test');
const assert = require('node:assert/strict');

const { _createExtensionApi } = require('../src/extension');

function createMockVscode({ themes = [], currentTheme = 'Default Dark+', startupSetting = false } = {}) {
  const updateCalls = [];
  const warnings = [];

  return {
    api: {
      extensions: {
        all: themes,
      },
      workspace: {
        getConfiguration(section) {
          if (section === 'workbench') {
            return {
              get(key) {
                if (key === 'colorTheme') {
                  return currentTheme;
                }
                return undefined;
              },
              update(key, value, target) {
                updateCalls.push({ key, value, target });
                return Promise.resolve();
              },
            };
          }

          return {
            get(key, defaultValue) {
              if (section === 'vscodeThemeRandomizer' && key === 'randomizeOnStartup') {
                return startupSetting;
              }
              return defaultValue;
            },
          };
        },
      },
      window: {
        showWarningMessage(message) {
          warnings.push(message);
          return Promise.resolve();
        },
      },
      commands: {
        registerCommand() {
          return { dispose() {} };
        },
      },
      ConfigurationTarget: {
        Global: 1,
      },
      ExtensionMode: {
        Test: 3,
      },
    },
    updateCalls,
    warnings,
  };
}

test('getInstalledThemeLabels returns unique non-empty labels', () => {
  const { api } = createMockVscode({
    themes: [
      {
        packageJSON: {
          contributes: {
            themes: [{ label: 'Theme A' }, { label: 'Theme B' }, { label: 'Theme A' }, { label: '   ' }],
          },
        },
      },
      {
        packageJSON: {
          contributes: {
            themes: [{ label: 'Theme C' }, {}],
          },
        },
      },
    ],
  });

  const extension = _createExtensionApi(api);
  assert.deepEqual(extension.getInstalledThemeLabels().sort(), ['Theme A', 'Theme B', 'Theme C']);
});

test('randomizeTheme avoids current theme when alternatives exist', async () => {
  const { api, updateCalls } = createMockVscode({
    currentTheme: 'Theme A',
    themes: [
      {
        packageJSON: {
          contributes: {
            themes: [{ label: 'Theme A' }, { label: 'Theme B' }],
          },
        },
      },
    ],
  });

  const extension = _createExtensionApi(api);
  const originalRandom = Math.random;
  Math.random = () => 0;

  try {
    await extension.randomizeTheme();
  } finally {
    Math.random = originalRandom;
  }

  assert.equal(updateCalls.length, 1);
  assert.deepEqual(updateCalls[0], { key: 'colorTheme', value: 'Theme B', target: 1 });
});

test('randomizeTheme warns when no themes are available', async () => {
  const { api, updateCalls, warnings } = createMockVscode();
  const extension = _createExtensionApi(api);

  await extension.randomizeTheme();

  assert.equal(updateCalls.length, 0);
  assert.deepEqual(warnings, ['No installed color themes were found.']);
});
