# vscode-theme-randomizer

Randomize your VS Code color theme from the sidebar, or automatically when a window opens.

## Features

- Sidebar button to randomize the active color theme.
- Setting to randomize theme on startup.

## Usage

1. Open the **Theme Randomizer** view in the Explorer sidebar.
2. Click **Randomize Theme** in the view title or in the view welcome content.

## Local testing on Windows 11

1. Install prerequisites:
   - [Git for Windows](https://git-scm.com/download/win)
   - [Node.js LTS](https://nodejs.org/) (includes `npm`)
   - [Visual Studio Code](https://code.visualstudio.com/)
2. Open **PowerShell** and clone the repository:
   ```powershell
   git clone https://github.com/skyhoshi/vscode-theme-randomizer.git
   cd vscode-theme-randomizer
   npm install
   code .
   ```
3. In VS Code, open **Run and Debug** (`Ctrl+Shift+D`).
4. Create a launch configuration:
   - Click **create a launch.json file**
   - Choose **VS Code Extension**
   - Keep the generated **Run Extension** configuration
5. Start local testing:
   - Select **Run Extension** in the debug dropdown
   - Press `F5` to open an **Extension Development Host** window
6. In the **Extension Development Host** window, verify the extension:
   - Open the Explorer sidebar and find **Theme Randomizer**
   - Click **Randomize Theme** in the view title, or run **Randomize Theme** from the Command Palette
7. Optional: test startup randomization:
   - Open Settings in the Extension Development Host
   - Enable `vscodeThemeRandomizer.randomizeOnStartup`
   - Run **Developer: Reload Window**
8. Run automated tests from the project terminal when needed:
   ```powershell
   npm test
   ```

## Settings

- `vscodeThemeRandomizer.randomizeOnStartup` (boolean, default `false`): Randomizes the VS Code color theme when a window opens.
