import * as vscode from "vscode";
import path from "path";
import * as fs from "fs";
import { Index } from "./extension";
import { Powershell } from "./powershell";
import { Config } from "./config";
import { MessageManager, MessageType } from "./MessageManager";

export namespace FileManager {
  export async function checkShortcutPath(shortcutPath: string, isStartUpCheck: boolean = false): Promise<boolean> {
    if (!shortcutPath || shortcutPath.trim() === "") {
      if (isStartUpCheck) {
        return false;
      }

      let path = (await findVscShortcut()) || Config.paths.vscUser;
      Index.config.update("shortcutPath", path, vscode.ConfigurationTarget.Global);
      shortcutPath = path;
    }
    if (!fs.existsSync(shortcutPath)) {
      MessageManager.showMessageWithName({
        type: isStartUpCheck ? "warning" : "error",
        message: `The provided shortcut path does not exist.`,
      });
      return false;
    }
    if (path.extname(shortcutPath).toLowerCase() !== ".lnk") {
      MessageManager.showMessageWithName({
        type: isStartUpCheck ? "warning" : "error",
        message: `The provided shortcut path is not a valid shortcut file.`,
      });
      return false;
    }

    const scData = Powershell.getShortcutData(shortcutPath);
    if (!scData) {
      MessageManager.showMessageWithName({ type: isStartUpCheck ? "warning" : "error", message: `Failed to get shortcut data.` });
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
      MessageManager.showMessageWithName({
        type: isStartUpCheck ? "warning" : "error",
        message: `The shortcut path does not point to a valid Visual Studio Code executable.`,
      });
      return false;
    }

    return true;
  }

  export async function checkIconPath(iconPath: string, isStartUpCheck: boolean = false): Promise<boolean> {
    if (!iconPath || iconPath.trim() === "") {
      MessageManager.showMessageWithName({
        type: isStartUpCheck ? "warning" : "error",
        message: `There is no icon path set.`,
      });
      return false;
    }
    if (!fs.existsSync(iconPath)) {
      MessageManager.showMessageWithName({
        type: isStartUpCheck ? "warning" : "error",
        message: `The provided icon path does not exist.`,
      });
      return false;
    }
    if (path.extname(iconPath).toLowerCase() !== ".ico") {
      MessageManager.showMessageWithName({
        type: isStartUpCheck ? "warning" : "error",
        message: `The provided icon path is not a valid icon file.`,
      });
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
