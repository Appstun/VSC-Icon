import * as vscode from "vscode";
import path from "path";
import * as fs from "fs";
import { Index } from "./extension";
import { Powershell } from "./powershell";
import { Config } from "./config";
import { MessageManager } from "./MessageManager";

export namespace FileManager {
  export async function checkShortcutPath(shortcutPath: string): Promise<boolean> {
    if (!shortcutPath || shortcutPath.trim() === "") {
      let path = (await findVscShortcut()) || Config.paths.vscUser;
      Index.config.update("shortcutPath", path, vscode.ConfigurationTarget.Global);
      shortcutPath = path;
    }
    if (!fs.existsSync(shortcutPath)) {
      vscode.window.showErrorMessage(`${Config.extensionName}: The provided shortcut path does not exist.`);
      return false;
    }
    if (path.extname(shortcutPath).toLowerCase() !== ".lnk") {
      vscode.window.showErrorMessage(`${Config.extensionName}: The provided shortcut path is not a valid shortcut file.`);
      return false;
    }

    const scData = Powershell.getShortcutData(shortcutPath);
    if (!scData) {
      vscode.window.showErrorMessage(`${Config.extensionName}: Failed to get shortcut data.`);
      return false;
    }
    const codePaths = Powershell.getCodeProcessPath();

    let found = false;
    for (let i = 0; i < codePaths.length; i++) {
      const codePath = codePaths[i];
      if (codePath.toLowerCase() === scData.targetPath.toLowerCase()) {
        found = true;
        break;
      }
    }
    if (!found) {
      vscode.window.showErrorMessage(`${Config.extensionName}: The shortcut path does not point to a valid Visual Studio Code executable.`);
      return false;
    }

    return true;
  }

  export async function checkIconPath(iconPath: string): Promise<boolean> {
    if (!iconPath || iconPath.trim() === "") {
      return false;
    }
    if (!fs.existsSync(iconPath)) {
      vscode.window.showErrorMessage(`${Config.extensionName}: The provided icon path does not exist.`);
      return false;
    }
    if (path.extname(iconPath).toLowerCase() !== ".ico") {
      vscode.window.showErrorMessage(`${Config.extensionName}: The provided icon path is not a valid icon file.`);
      return false;
    }
    return true;
  }

  export async function findVscShortcut(): Promise<string | undefined> {
    let result: string | undefined = undefined;
    const progress = new MessageManager.ProgressMessage({
      title: Config.extensionName,
      firstMessage: "Checking for VS Code shortcuts...",
    });
    await progress.waitMiliseconds(250);
    if (fs.existsSync(Config.paths.vscUser)) {
      progress.setProgress("Found VS Code shortcut (User).");
      result = Config.paths.vscUser;
    } else {
      if (fs.existsSync(Config.paths.vscSystem)) {
        progress.setProgress("Found VS Code shortcut (System).");
        await progress.waitMiliseconds(750);
        progress.setProgress("Copying System shortcut to User ...");

        const userDir = path.dirname(Config.paths.vscUser);
        if (!fs.existsSync(userDir)) {
          fs.mkdirSync(userDir, { recursive: true });
        }
        fs.copyFileSync(Config.paths.vscSystem, Config.paths.vscUser);
        result = Config.paths.vscUser;
      }
    }

    await progress.waitMiliseconds(250);
    progress.finish();
    return result;
  }
}
