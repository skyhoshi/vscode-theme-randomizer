const test = require('node:test');
const assert = require('node:assert/strict');

const { createExtensionApi } = require('../src/themeRandomizer');

function createMockVscode({
  themes = [],
  currentTheme = 'Default Dark+',
  startupSetting = false,
  defaultTheme = '',
  themeType = 'system',
} = {}) {
  const updateCalls = [];
  const warnings = [];
  const settings = { randomizeOnStartup: startupSetting, defaultTheme, themeType };

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
              if (section === 'vscodeThemeRandomizer' && key in settings) {
                return settings[key];
              }
              return defaultValue;
            },
            update(key, value, target) {
              settings[key] = value;
              updateCalls.push({ key, value, target });
              return Promise.resolve();
            },
          };
        },
      },
      window: {
        showWarningMessage(message) {
          warnings.push(message);
          return Promise.resolve();
        },
        showInformationMessage() {
          return Promise.resolve();
        },
        showQuickPick(items) {
          return Promise.resolve(items[0]);
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

  const extension = createExtensionApi(api);
  assert.deepEqual(extension.getInstalledThemeLabels().sort(), ['Theme A', 'Theme B', 'Theme C']);
});

test('randomizeTheme avoids current theme when alternatives exist', async () => {
  const { api, updateCalls } = createMockVscode({
    currentTheme: 'Theme A',
    defaultTheme: 'Theme A',
    themes: [
      {
        packageJSON: {
          contributes: {
            themes: [{ label: 'Theme A' }, { label: 'Theme B' }, { label: 'Theme C' }],
          },
        },
      },
    ],
  });

  const extension = createExtensionApi(api, { random: () => 0.6 });
  await extension.randomizeTheme();

  assert.equal(updateCalls.length, 1);
  assert.equal(updateCalls[0].key, 'colorTheme');
  assert.equal(updateCalls[0].target, 1);
  assert.equal(updateCalls[0].value, 'Theme C');
});

test('randomizeTheme only selects themes of the configured type', async () => {
  const { api, updateCalls } = createMockVscode({
    currentTheme: 'Theme A',
    defaultTheme: 'Theme A',
    themeType: 'vs-dark',
    themes: [{
      packageJSON: {
        contributes: {
          themes: [
            { label: 'Theme A', uiTheme: 'vs' },
            { label: 'Theme B', uiTheme: 'vs-dark' },
            { label: 'Theme C', uiTheme: 'vs-dark' },
          ],
        },
      },
    }],
  });

  await createExtensionApi(api, { random: () => 0.9 }).randomizeTheme();

  assert.deepEqual(updateCalls, [{ key: 'colorTheme', value: 'Theme C', target: 1 }]);
});

test('randomizeTheme stores the active theme as the default on first run only', async () => {
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

  const extension = createExtensionApi(api, { random: () => 0 });
  await extension.randomizeTheme();

  assert.deepEqual(updateCalls[0], { key: 'defaultTheme', value: 'Theme A', target: 1 });

  await extension.randomizeTheme();

  assert.equal(updateCalls.filter((call) => call.key === 'defaultTheme').length, 1);
});

test('resetToDefaultTheme restores the stored default theme', async () => {
  const { api, updateCalls } = createMockVscode({ currentTheme: 'Theme B', defaultTheme: 'Theme A' });
  const extension = createExtensionApi(api);

  await extension.resetToDefaultTheme();

  assert.deepEqual(updateCalls, [{ key: 'colorTheme', value: 'Theme A', target: 1 }]);
});

test('resetToDefaultTheme warns when no default theme is stored', async () => {
  const { api, updateCalls, warnings } = createMockVscode();
  const extension = createExtensionApi(api);

  await extension.resetToDefaultTheme();

  assert.equal(updateCalls.length, 0);
  assert.deepEqual(warnings, ['No default color theme has been stored yet.']);
});

test('randomizeTheme warns when no themes are available', async () => {
  const { api, updateCalls, warnings } = createMockVscode();
  const extension = createExtensionApi(api);

  await extension.randomizeTheme();

  assert.equal(updateCalls.length, 0);
  assert.deepEqual(warnings, ['No installed color themes were found.']);
});


test('randomizeTheme falls back to current theme when it is the only option', async () => {
  const { api, updateCalls } = createMockVscode({
    currentTheme: 'Theme A',
    defaultTheme: 'Theme A',
    themes: [
      {
        packageJSON: {
          contributes: {
            themes: [{ label: 'Theme A' }],
          },
        },
      },
    ],
  });

  const extension = createExtensionApi(api, { random: () => 0 });
  await extension.randomizeTheme();

  assert.equal(updateCalls.length, 1);
  assert.deepEqual(updateCalls[0], { key: 'colorTheme', value: 'Theme A', target: 1 });
});
