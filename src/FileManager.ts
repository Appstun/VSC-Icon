import * as vscode from "vscode";
import path from "path";
import * as fs from "fs";
import { Index } from "./extension";
import { Powershell } from "./powershell";
import { Config } from "./config";

export namespace FileManager {
  export function checkShortcutPath(shortcutPath: string): boolean {
    if (!shortcutPath || shortcutPath.trim() === "") {
      let path = `${process.env.APPDATA}\\Microsoft\\Windows\\Start Menu\\Programs\\Visual Studio Code\\Visual Studio Code.lnk`;
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

  export function checkIconPath(iconPath: string): boolean {
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
}
