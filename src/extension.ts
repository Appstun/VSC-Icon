import * as vscode from "vscode";
import * as fs from "fs";
import { Powershell } from "./powershell";
import { FileManager } from "./FileManager";
import { Config } from "./config";
import { MessageManager } from "./MessageManager";

export namespace Index {
  export let config = vscode.workspace.getConfiguration(Config.extentionId);

  export function registerCommands({ subscriptions }: vscode.ExtensionContext) {
    const cmdSetIcon = vscode.commands.registerCommand(Config.commands.setIcon, async () => {
      Index.reloadConfig();

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
        MessageManager.showMessageWithName({
          type: "error",
          message: `Failed to set the icon.`,
        });
        return;
      }

      MessageManager.showMessageWithName(`The icon has been successfully set.`);
      MessageManager.showMessage("You can now restart your Visual Studio Code to see the changes in the taskbar.");
      Index.config.update(Config.configKeys.promptOnActivate, false, vscode.ConfigurationTarget.Global);
    });

    const cmdSetIconPath = vscode.commands.registerCommand(Config.commands.setIconPath, async () => {
      Index.reloadConfig();

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
            MessageManager.showMessageWithName(`The icon path has been successfully set.`);
            vscode.commands.executeCommand(Config.commands.setIcon);
          }
        });
    });
    const cmdSetShortcutPath = vscode.commands.registerCommand(Config.commands.setShortcutPath, async () => {
      Index.reloadConfig();

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
        .then(async (value) => {
          if (value) {
            let isScpath = await FileManager.checkShortcutPath(value);
            if (!isScpath) {
              return;
            }

            Index.config.update(Config.configKeys.shortcutPath, value, vscode.ConfigurationTarget.Global);
            Index.config.update(Config.configKeys.shortcutPath, value, vscode.ConfigurationTarget.Workspace);
            MessageManager.showMessageWithName(`The shortcut path has been successfully set.`);
          }
        });
    });
    const cmdFindShortcut = vscode.commands.registerCommand(Config.commands.findShortcut, async () => {
      let path = await FileManager.findVscShortcut();
      if (path) {
        Index.config.update(Config.configKeys.shortcutPath, path, vscode.ConfigurationTarget.Global);
        Index.config.update(Config.configKeys.shortcutPath, path, vscode.ConfigurationTarget.Workspace);
        MessageManager.showMessageWithName(`The shortcut path has been successfully set.`);
      } else {
        MessageManager.showMessageWithName({
          type: "error",
          message: `Failed to find the Visual Studio Code shortcut. Please enter in manually.`,
        });
        vscode.commands.executeCommand(Config.commands.setShortcutPath);
      }
    });

    subscriptions.push(cmdSetIcon);
    subscriptions.push(cmdSetIconPath);
    subscriptions.push(cmdSetShortcutPath);
    subscriptions.push(cmdFindShortcut);
  }

  export function reloadConfig() {
    Index.config = vscode.workspace.getConfiguration(Config.extentionId);
  }
}

export async function activate(context: vscode.ExtensionContext) {
  if (process.platform !== "win32") {
    MessageManager.showMessageWithName({
      type: "error",
      message: `This extension only works on Windows. Other platforms are not supported currently.`,
    });
    return;
  }
  Index.registerCommands(context);

  if (Index.config.get(Config.configKeys.promptOnActivate, false)) {
    MessageManager.showMessageWithName(
      {
        type: "error",
        message: "You are now about to change the icon of Visual Studio Code.",
      },
      {
        modal: true,
        detail: `This is send by the extension ${Config.extensionName}.`,
      }
    ).then(() => {
      vscode.commands.executeCommand(Config.commands.setIconPath);
      Index.config.update(Config.configKeys.promptOnActivate, false, vscode.ConfigurationTarget.Global);
      Index.config.update(Config.configKeys.promptOnActivate, false, vscode.ConfigurationTarget.Workspace);
    });
    return;
  }

  FileManager.checkIconPath(Index.config.get(Config.configKeys.iconPath, ""));
  FileManager.checkShortcutPath(Index.config.get(Config.configKeys.shortcutPath, ""));
}

export function deactivate() {}
