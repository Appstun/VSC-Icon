import * as fs from "fs";
import path from "path";
import { Config } from "./config";
import { Index } from "./extension";
import { MessageManager } from "./MessageManager";
import { Powershell } from "./powershell";

export namespace FileManager {
  export async function checkShortcutPath(shortcutPath: string, isStartUpCheck: boolean = false): Promise<boolean> {
    if (!shortcutPath || shortcutPath.trim() === "") {
      if (isStartUpCheck) {
        Index.pathStates.shortcut = false;
        return false;
      }

      let path = (await findVscShortcut()) || Config.paths.vscUser;
      Index.globalState.update("shortcutPath", path);
      shortcutPath = path;
    }
    if (!fs.existsSync(shortcutPath)) {
      MessageManager.showMessageWithName({
        type: isStartUpCheck ? "warning" : "error",
        message: `The provided shortcut path does not exist.`,
      });
      Index.pathStates.shortcut = false;
      return false;
    }
    if (path.extname(shortcutPath).toLowerCase() !== ".lnk") {
      MessageManager.showMessageWithName({
        type: isStartUpCheck ? "warning" : "error",
        message: `The provided shortcut path is not a valid shortcut file.`,
      });
      Index.pathStates.shortcut = false;
      return false;
    }

    const scData = Powershell.getShortcutData(shortcutPath);
    if (!scData) {
      MessageManager.showMessageWithName({ type: isStartUpCheck ? "warning" : "error", message: `Failed to get shortcut data.` });
      Index.pathStates.shortcut = false;
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
      Index.pathStates.shortcut = false;
      return false;
    }

    Index.pathStates.shortcut = true;
    return true;
  }

  export async function checkIconPath(iconPath: string, isStartUpCheck: boolean = false): Promise<boolean> {
    if (!iconPath || iconPath.trim() === "") {
      MessageManager.showMessageWithName({
        type: isStartUpCheck ? "warning" : "error",
        message: `There is no icon path set.`,
      });
      Index.pathStates.icon = false;
      return false;
    }
    if (!fs.existsSync(iconPath)) {
      MessageManager.showMessageWithName({
        type: isStartUpCheck ? "warning" : "error",
        message: `The provided icon path does not exist.`,
      });
      Index.pathStates.icon = false;
      return false;
    }
    if (path.extname(iconPath).toLowerCase() !== ".ico") {
      MessageManager.showMessageWithName({
        type: isStartUpCheck ? "warning" : "error",
        message: `The provided icon path is not a valid icon file.`,
      });
      Index.pathStates.icon = false;
      return false;
    }
    Index.pathStates.icon = true;
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
    Index.pathStates.shortcut = result !== undefined;
    return result;
  }
}
