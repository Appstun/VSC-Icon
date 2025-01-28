import { spawnSync } from "child_process";
import path from "path";
import { Logging } from "./logging";

export type ShortcutData = {
  fullName: string;
  arguments: string;
  description: string;
  hotkey: string;
  iconLocation: string;
  relativePath: string;
  targetPath: string;
  windowStyle: number;
  workingDirectory: string;
};

export namespace Powershell {
  export function getShortcutData(shortcutPath: string): ShortcutData | undefined {
    const cmd =
      `$WScriptShell = New-Object -ComObject WScript.Shell; ` +
      `$shortcut = $WScriptShell.CreateShortcut('${shortcutPath}'); ` +
      `$shortcut | Format-List | Out-String -Width 16384`;

    let process = spawnSync(`powershell -command "${cmd}"`, { shell: true, timeout: 15000 });

    if (process.status !== 0) {
      Logging.logger("error", "(getShortcutData) Failed to get the shortcut data.");
      Logging.logger("error", process.stderr.toString(), true);
      return undefined;
    }

    let output: ShortcutData = {
      fullName: "",
      arguments: "",
      description: "",
      hotkey: "",
      iconLocation: "",
      relativePath: "",
      targetPath: "",
      windowStyle: -1,
      workingDirectory: "",
    };

    let lines = process.stdout.toString().split("\r\n");
    for (let i = 0; i < lines.length; i++) {
      let data = lines[i].trim().split(" : ");

      let value = data[1] ? data[1].trim() : " ";
      switch (data[0].trim()) {
        case "FullName":
          output.fullName = value;
          break;
        case "Arguments":
          output.arguments = value;
          break;
        case "Description":
          output.description = value;
          break;
        case "Hotkey":
          output.hotkey = value;
          break;
        case "IconLocation":
          output.iconLocation = value;
          break;
        case "RelativePath":
          output.relativePath = value;
          break;
        case "TargetPath":
          output.targetPath = value;
          break;
        case "WindowStyle":
          output.windowStyle = isNaN(parseInt(value)) ? -1 : parseInt(value);
          break;
        case "WorkingDirectory":
          output.workingDirectory = value;
          break;
      }
    }

    return output;
  }

  export function getCodeProcessPath(): string[] {
    let codeProcess = spawnSync(`powershell -command (Get-Process -Name 'Code').path`, { shell: true, timeout: 15000 });

    if (codeProcess.status !== 0) {
      Logging.logger("error", "(getCodeProcessPath) Failed to get the path of the Code process.");
      Logging.logger("error", codeProcess.stderr.toString(), true);
    }

    let paths: string[] = [];
    const lines = codeProcess.stdout.toString().trim().split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes("code.exe") && !paths.includes(lines[i])) {
        paths.push(lines[i]);
      }
    }

    return paths;
  }

  export function setShortcutIcon(shortcutPath: string, iconPath: string): boolean {
    const psCommand =
      `$WScriptShell = New-Object -ComObject WScript.Shell; ` +
      `$shortcut = $WScriptShell.CreateShortcut('${path.resolve(shortcutPath)}'); ` +
      `$shortcut.IconLocation = '\"${path.resolve(iconPath)}\",0'; ` +
      `$shortcut.Save();`;

    let executeIconChange = spawnSync(`powershell -command "${psCommand}"`, { shell: true, timeout: 15000 });
    if (executeIconChange.status !== 0) {
      Logging.logger("error", "(setShortcutIcon) Failed to set the icon.");
      Logging.logger("error", executeIconChange.stderr.toString(), true);
    }

    return executeIconChange.status === 0;
  }
}
