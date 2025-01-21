import * as vscode from "vscode";
import * as fs from "fs";
import { Powershell } from "./powershell";
import { FileManager } from "./FileManager";
import { Config } from "./config";

export namespace Index {
  export const config = vscode.workspace.getConfiguration("vscIcon");

  export function registerCommands({ subscriptions }: vscode.ExtensionContext) {
    const cmdSetIcon = vscode.commands.registerCommand(Config.commands.setIcon, async () => {
      let isScpath = await FileManager.checkShortcutPath(Index.config.get(Config.configKeys.shortcutPath, ""));
      if (!isScpath) {
        return;
      }
      let isIconpath = await FileManager.checkIconPath(Index.config.get(Config.configKeys.iconPath, ""));
      if (!isIconpath) {
        return;
      }

      if (
        !Powershell.setShortcutIcon(Index.config.get(Config.configKeys.shortcutPath, ""), Index.config.get(Config.configKeys.iconPath, ""))
      ) {
        vscode.window.showErrorMessage(`${Config.extensionName}: Failed to set the icon.`);
        return;
      }

      vscode.window.showInformationMessage(`${Config.extensionName}: The icon has been successfully set.`);
      vscode.window.showInformationMessage("You can now restart your Visual Studio Code to see the changes in the taskbar.");
      Index.config.update(Config.configKeys.promptOnActivate, false, vscode.ConfigurationTarget.Global);
    });

    const cmdSetIconPath = vscode.commands.registerCommand(Config.commands.setIconPath, async () => {
      vscode.window
        .showInputBox({
          title: "Enter the path to a .ico-file",
          ignoreFocusOut: true,
          placeHolder: "C:\\path\\to\\icon.ico",
          value: Index.config.get(Config.configKeys.iconPath, ""),
          validateInput: (input) => {
            if (!input.toLowerCase().endsWith(".ico")) {
              return "Please enter a valid .ico file path.";
            }
            if (!fs.existsSync(input)) {
              return "The file does not exist.";
            }
            return null;
          },
        })
        .then(async (value) => {
          if (value) {
            let isIconpath = await FileManager.checkIconPath(value);
            if (!isIconpath) {
              return;
            }

            Index.config.update(Config.configKeys.iconPath, value, vscode.ConfigurationTarget.Global);
            Index.config.update(Config.configKeys.iconPath, value, vscode.ConfigurationTarget.Workspace);
            vscode.window.showInformationMessage(`${Config.extensionName}: The icon path has been successfully set.`);
            vscode.commands.executeCommand(Config.commands.setIcon);
          }
        });
    });
    const cmdSetShortcutPath = vscode.commands.registerCommand(Config.commands.setShortcutPath, async () => {
      vscode.window
        .showInputBox({
          title: "Enter the path to a .lnk-file of Visual Studio Code",
          ignoreFocusOut: true,
          placeHolder: "C:\\path\\to\\shortcut.lnk",
          value: Index.config.get(Config.configKeys.shortcutPath, ""),
          validateInput: (input) => {
            if (!input.toLowerCase().endsWith(".lnk")) {
              return "Please enter a valid .lnk file path.";
            }
            if (!fs.existsSync(input)) {
              return "The file does not exist.";
            }
            return null;
          },
        })
        .then((value) => {
          if (value) {
            let isScpath = FileManager.checkShortcutPath(value);
            if (!isScpath) {
              return;
            }

            Index.config.update(Config.configKeys.shortcutPath, value, vscode.ConfigurationTarget.Global);
            Index.config.update(Config.configKeys.shortcutPath, value, vscode.ConfigurationTarget.Workspace);
            vscode.window.showInformationMessage(`${Config.extensionName}: The shortcut path has been successfully set.`);
          }
        });
    });
    const cmdFindShortcut = vscode.commands.registerCommand(Config.commands.findShortcut, async () => {
      let path = await FileManager.findVscShortcut();
      if (path) {
        Index.config.update(Config.configKeys.shortcutPath, path, vscode.ConfigurationTarget.Global);
        Index.config.update(Config.configKeys.shortcutPath, path, vscode.ConfigurationTarget.Workspace);
        vscode.window.showInformationMessage(`${Config.extensionName}: The shortcut path has been successfully set.`);
      } else {
        vscode.window.showErrorMessage(
          `${Config.extensionName}: Failed to find the Visual Studio Code shortcut. Please enter in manually.`
        );
      }
    });

    subscriptions.push(cmdSetIcon);
    subscriptions.push(cmdSetIconPath);
    subscriptions.push(cmdSetShortcutPath);
    subscriptions.push(cmdFindShortcut);
  }
}

export async function activate(context: vscode.ExtensionContext) {
  if (process.platform !== "win32") {
    vscode.window.showErrorMessage(
      `${Config.extensionName}: This extension only works on Windows. Other platforms are not supported currently.`
    );
    return;
  }

  Index.registerCommands();

  if (!Index.config.get("promptOnActivate", false)) {
    return;
  }

  vscode.window
    .showInformationMessage("You are now about to change the icon of Visual Studio Code.", {
      modal: true,
      detail: "This is send by the extension VSC Icon.",
    })
    .then(() => {
      vscode.commands.executeCommand("vscIcon.setIconPath");
	  Index.config.update("promptOnActivate", false, vscode.ConfigurationTarget.Global);
	  Index.config.update("promptOnActivate", false, vscode.ConfigurationTarget.Workspace);
    });
}

export function deactivate() {}
