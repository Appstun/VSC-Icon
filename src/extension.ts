import * as vscode from "vscode";
import { Config } from "./config";
import { FileManager } from "./FileManager";
import { MessageManager } from "./MessageManager";
import { Powershell } from "./powershell";

export namespace Index {
  export let globalState: vscode.Memento;
  export let logger = vscode.window.createOutputChannel(Config.extensionName);
  export let pathStates: { icon: boolean | "question"; shortcut: boolean | "question" } = { icon: false, shortcut: false };
  export const dev_states = { clearStates: false };

  export function registerCommands({ subscriptions }: vscode.ExtensionContext) {
    const cmdSetIcon = vscode.commands.registerCommand(Config.commands.setIcon, async () => {
      let progress = new MessageManager.ProgressMessage(
        { title: Config.extensionName, firstMessage: "Checking files...." },
        { cancellable: false }
      );

      let isScpath = await FileManager.checkShortcutPath(Index.globalState.get(Config.globalState.shortcutPath, ""));
      if (!isScpath) {
        progress.finish();
        return;
      }
      let isIconpath = await FileManager.checkIconPath(Index.globalState.get(Config.globalState.iconPath, ""));
      if (!isIconpath) {
        progress.finish();
        return;
      }

      progress.setProgress("Setting the icon....");
      if (
        !Powershell.setShortcutIcon(
          Index.globalState.get(Config.globalState.shortcutPath, ""),
          Index.globalState.get(Config.globalState.iconPath, "")
        )
      ) {
        MessageManager.showMessageWithName({
          type: "error",
          message: `Failed to set the icon. Please check the paths.`,
        });
        pathStates = { icon: "question", shortcut: "question" };
        progress.finish();
        return;
      }

      MessageManager.showMessageWithName(`The icon has been successfully set.`);
      MessageManager.showMessage({
        type: "warning",
        message: "Please restart VS Code to see the changes in the taskbar.",
      });
      progress.finish();
    });

    const cmdSetIconPath = vscode.commands.registerCommand(Config.commands.setIconPath, async () => {
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

      await Index.globalState.update(Config.globalState.iconPath, path);
      MessageManager.showMessageWithName(`The icon path has been successfully set. Do you want to set the icon?`, undefined, [
        "Set Icon",
      ]).then((btnPressed) => {
        if (btnPressed === "Set Icon") {
          vscode.commands.executeCommand(Config.commands.setIcon);
        }
      });
    });
    const cmdSetShortcutPath = vscode.commands.registerCommand(Config.commands.setShortcutPath, async () => {
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

      Index.globalState.update(Config.globalState.shortcutPath, path);
      MessageManager.showMessageWithName(`The shortcut path has been successfully set.`);
    });
    const cmdFindShortcut = vscode.commands.registerCommand(Config.commands.findShortcut, async () => {
      let path = await FileManager.findVscShortcut();
      if (path) {
        Index.globalState.update(Config.globalState.shortcutPath, path);
        MessageManager.showMessageWithName(`The shortcut path has been successfully set.`);
      } else {
        MessageManager.showMessageWithName(
          {
            type: "error",
            message: `Failed to find the Visual Studio Code shortcut. Please enter in manually.`,
          },
          undefined,
          ["Set Manually"]
        ).then((btnPress) => {
          if (btnPress === "Set Manually") {
            vscode.commands.executeCommand(Config.commands.setShortcutPath);
          }
        });
      }
    });
    const cmdMenu = vscode.commands.registerCommand(Config.commands.menu, async () => {
      let iconIcon = "$(warning)";
      let iconShortcut = "$(warning)";
      if (pathStates.icon === true) {
        iconIcon = "$(pass)";
      } else if (pathStates.icon === "question") {
        iconIcon = "$(question)";
      }
      if (pathStates.shortcut === true) {
        iconShortcut = "$(pass)";
      } else if (pathStates.shortcut === "question") {
        iconShortcut = "$(question)";
      }

      let choice = await MessageManager.showQuickPick(
        [
          `${pathStates.icon && pathStates.shortcut ? "$(star)" : "$(error)"}` + `       $(screen-full)  Set Icon as VS Code Shortcut Icon`,
          `${iconIcon}` + `       $(folder-opened)  Select Icon Path`,
          `${iconShortcut}` + `       $(file-symlink-file)  Select VS Code Shortcut Path`,
          `            $(search)  Find VS Code Shortcut Path`,
        ],
        {
          title: "[MENU] VSC Icon",
          canPickMany: false,
          placeHolder: "Select an option",
        }
      );

      switch (choice) {
        case 0:
          vscode.commands.executeCommand(Config.commands.setIcon);
          break;
        case 1:
          vscode.commands.executeCommand(Config.commands.setIconPath);
          break;
        case 2:
          vscode.commands.executeCommand(Config.commands.setShortcutPath);
          break;
        case 3:
          vscode.commands.executeCommand(Config.commands.findShortcut);
          break;
      }
    });

    subscriptions.push(cmdSetIcon);
    subscriptions.push(cmdSetIconPath);
    subscriptions.push(cmdSetShortcutPath);
    subscriptions.push(cmdFindShortcut);
    subscriptions.push(cmdMenu);
  }
}

export async function activate(context: vscode.ExtensionContext) {
  if (Index.dev_states.clearStates) {
    console.log("Clearing global state...");
    const keys = context.globalState.keys();
    for (const key of keys) {
      await context.globalState.update(key, undefined);
    }
  }
  Index.globalState = context.globalState;

  if (process.platform !== "win32") {
    MessageManager.showMessageWithName({
      type: "error",
      message: `This extension only works on Windows. Other platforms are not supported currently.`,
    });
    return;
  }
  Index.registerCommands(context);

  let promptOnActivate = context.globalState.get<boolean>(Config.globalState.promptOnActivate) ?? true;
  if (promptOnActivate === true) {
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
      context.globalState.update(Config.globalState.promptOnActivate, false);
    } else {
      MessageManager.showMessage("Ok ... see you at next start up.");
    }
    return;
  }

  FileManager.checkIconPath(Index.globalState.get(Config.globalState.iconPath, ""), true);
  FileManager.checkShortcutPath(Index.globalState.get(Config.globalState.shortcutPath, ""), true);

  const version = context.globalState.get<string>(Config.globalState.vscVersion);
  if (version && version !== vscode.version) {
    MessageManager.showMessageWithName(
      {
        type: "info",
        message: `There was a Visual Studio Code update. Do you want to set the icon again?`,
      },
      undefined,
      ["Set Icon"]
    ).then((btnPressed) => {
      if (btnPressed === "Set Icon") {
        vscode.commands.executeCommand(Config.commands.setIcon);
      }

      context.globalState.update(Config.globalState.vscVersion, vscode.version);
    });
  } else {
    context.globalState.update(Config.globalState.vscVersion, vscode.version);
  }
}

export function deactivate() {}
