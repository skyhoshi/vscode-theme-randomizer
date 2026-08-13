# vscode-theme-randomizer

Randomize your VS Code color theme from the sidebar, or automatically when a window opens.

## Features

- Sidebar button to randomize the active color theme.
- Setting to randomize theme on startup.

## Usage

1. Open the **Theme Randomizer** view in the Explorer sidebar.
2. Click **Randomize Theme** in the view title or in the view welcome content.

## Local development setup (Windows 11)

1. Install prerequisites:
   - [Git for Windows](https://git-scm.com/download/win)
   - [Node.js LTS](https://nodejs.org/) (includes `npm`)
   - [Visual Studio Code](https://code.visualstudio.com/)
2. Open **PowerShell** and clone the repository:
   ```powershell
   git clone https://github.com/skyhoshi/vscode-theme-randomizer.git
   cd vscode-theme-randomizer
   ```
3. Install dependencies:
   ```powershell
   npm install
   ```
4. Open the folder in VS Code:
   ```powershell
   code .
   ```
5. Press `F5` in VS Code to launch an **Extension Development Host** window and test the extension locally.
6. Run tests from a terminal when needed:
   ```powershell
   npm test
   ```

## Settings

- `vscodeThemeRandomizer.randomizeOnStartup` (boolean, default `false`): Randomizes the VS Code color theme when a window opens.
