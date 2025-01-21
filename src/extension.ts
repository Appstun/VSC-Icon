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

      let progress = new MessageManager.ProgressMessage(
        { title: Config.extensionName, firstMessage: "Checking files...." },
        { cancellable: false }
      );

      let isScpath = await FileManager.checkShortcutPath(Index.config.get(Config.configKeys.shortcutPath, ""));
      if (!isScpath) {
        progress.finish();
        return;
      }
      let isIconpath = await FileManager.checkIconPath(Index.config.get(Config.configKeys.iconPath, ""));
      if (!isIconpath) {
        progress.finish();
        return;
      }

      progress.setProgress("Setting the icon....");
      if (
        !Powershell.setShortcutIcon(Index.config.get(Config.configKeys.shortcutPath, ""), Index.config.get(Config.configKeys.iconPath, ""))
      ) {
        MessageManager.showMessageWithName({
          type: "error",
          message: `Failed to set the icon.`,
        });
        progress.finish();
        return;
      }

      MessageManager.showMessageWithName(`The icon has been successfully set.`);
      MessageManager.showMessage("You can now restart your Visual Studio Code to see the changes in the taskbar.");
      Index.config.update(Config.configKeys.promptOnActivate, false, vscode.ConfigurationTarget.Global);
      progress.finish();
    });

    const cmdSetIconPath = vscode.commands.registerCommand(Config.commands.setIconPath, async () => {
      Index.reloadConfig();

      MessageManager.showMessageWithName("Please select a icon file.");
      let select = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        defaultUri: vscode.Uri.file(Config.paths.usrDesktop),
        filters: { "Icon files": ["ico"] },
        openLabel: "Select",
        title: "Select a icon file",
      });
      if (!select) {
        return;
      }
      let path = select[0].fsPath;

      let isIconpath = await FileManager.checkIconPath(path);
      if (!isIconpath) {
        return;
      }

      Index.config.update(Config.configKeys.iconPath, path, vscode.ConfigurationTarget.Global);
      Index.config.update(Config.configKeys.iconPath, path, vscode.ConfigurationTarget.Workspace);
      MessageManager.showMessageWithName(`The icon path has been successfully set.`);
      vscode.commands.executeCommand(Config.commands.setIcon);
    });
    const cmdSetShortcutPath = vscode.commands.registerCommand(Config.commands.setShortcutPath, async () => {
      Index.reloadConfig();

      MessageManager.showMessageWithName("Please select the Visual Studio Code shortcut.");
      let select = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        defaultUri: vscode.Uri.file(Config.paths.usrStartMenu),
        filters: { "Shortcut files": ["lnk"] },
        openLabel: "Select",
        title: "Select the VS Code shortcut file",
      });
      if (!select) {
        return;
      }
      let path = select[0].fsPath;

      let isScpath = await FileManager.checkShortcutPath(path);
      if (!isScpath) {
        return;
      }

      Index.config.update(Config.configKeys.shortcutPath, path, vscode.ConfigurationTarget.Global);
      Index.config.update(Config.configKeys.shortcutPath, path, vscode.ConfigurationTarget.Workspace);
      MessageManager.showMessageWithName(`The shortcut path has been successfully set.`);
    });
    const cmdFindShortcut = vscode.commands.registerCommand(Config.commands.findShortcut, async () => {
      let path = await FileManager.findVscShortcut();
      if (path) {
        Index.config.update(Config.configKeys.shortcutPath, path, vscode.ConfigurationTarget.Global);
        Index.config.update(Config.configKeys.shortcutPath, path, vscode.ConfigurationTarget.Workspace);
        MessageManager.showMessageWithName(`The shortcut path has been successfully set.`);
      } else {
        let btnPress = await MessageManager.showMessageWithName(
          {
            type: "error",
            message: `Failed to find the Visual Studio Code shortcut. Please enter in manually.`,
          },
          undefined,
          ["Set Manually"]
        );

        if (btnPress === "Set Manually") {
          vscode.commands.executeCommand(Config.commands.setShortcutPath);
        }
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
    let btnPress = await MessageManager.showMessage(
      {
        type: "info",
        message: "Do you want to change the icon of Visual Studio Code?",
      },
      {
        modal: true,
        detail: `This message is sent from the extension ${Config.extensionName}.`,
      },
      ["Next Step"]
    );

    if (btnPress === "Next Step") {
      vscode.commands.executeCommand(Config.commands.setIconPath);
      Index.config.update(Config.configKeys.promptOnActivate, false, vscode.ConfigurationTarget.Global);
      Index.config.update(Config.configKeys.promptOnActivate, false, vscode.ConfigurationTarget.Workspace);
    } else {
      MessageManager.showMessage("Ok ... see you at next start up.");
    }
    return;
  }

  FileManager.checkIconPath(Index.config.get(Config.configKeys.iconPath, ""), true);
  FileManager.checkShortcutPath(Index.config.get(Config.configKeys.shortcutPath, ""), true);
}

export function deactivate() {}
