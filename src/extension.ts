// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { spawnSync } from "child_process";
import path from "path";
import * as fs from "fs";
import { Powershell } from "./powershell";
import { FileManager } from "./FileManager";
import { config } from "process";

export namespace Index {
  export const config = vscode.workspace.getConfiguration("vscIcon");

  export function registerCommands() {
    vscode.commands.registerCommand("vscIcon.setIcon", async () => {
      let isScpath = FileManager.checkShortcutPath(Index.config.get("shortcutPath", ""));
      if (!isScpath) {
        return;
      }
      let isIconpath = FileManager.checkIconPath(Index.config.get("iconPath", ""));
      if (!isIconpath) {
        return;
      }

      if (!Powershell.setShortcutIcon(Index.config.get("shortcutPath", ""), Index.config.get("iconPath", ""))) {
        vscode.window.showErrorMessage("VSC Icon: Failed to set the icon.");
        return;
      }

      vscode.window.showInformationMessage("VSC Icon: The icon has been successfully set.");
      vscode.window.showInformationMessage("You can now restart your Visual Studio Code to see the changes in the taskbar.");
      Index.config.update("promptOnActivate", false, vscode.ConfigurationTarget.Global);
    });

    vscode.commands.registerCommand("vscIcon.setIconPath", async () => {
      vscode.window
        .showInputBox({
          title: "Enter the path to a .ico-file",
          ignoreFocusOut: true,
          placeHolder: "C:\\path\\to\\icon.ico",
          value: Index.config.get("iconPath", undefined),
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
        .then((value) => {
          if (value) {
            let isIconpath = FileManager.checkIconPath(Index.config.get("iconPath", ""));
            if (!isIconpath) {
              return;
            }

            Index.config.update("iconPath", value, vscode.ConfigurationTarget.Global);
            Index.config.update("iconPath", value, vscode.ConfigurationTarget.Workspace);
            vscode.window.showInformationMessage("VSC Icon: The icon path has been successfully set.");
            vscode.commands.executeCommand("vscIcon.setIcon");
          }
        });
    });
    vscode.commands.registerCommand("vscIcon.setShortcutPath", async () => {
      vscode.window
        .showInputBox({
          title: "Enter the path to a .lnk-file of Visual Studio Code",
          ignoreFocusOut: true,
          placeHolder: "C:\\path\\to\\shortcut.lnk",
          value: Index.config.get("iconPath", undefined),
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

            Index.config.update("shortcutPath", value, vscode.ConfigurationTarget.Global);
            Index.config.update("shortcutPath", value, vscode.ConfigurationTarget.Workspace);
            vscode.window.showInformationMessage("VSC Icon: The shortcut path has been successfully set.");
          }
        });
    });
  }
}
export async function activate(context: vscode.ExtensionContext) {
  if (process.platform !== "win32") {
    vscode.window.showErrorMessage("VSC Icon: This extension only works on Windows. Other platforms are not supported currently.");
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
