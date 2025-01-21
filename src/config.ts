export namespace Config {
  export const extentionId = "vscIcon";
  export const extensionName = "VSC Icon";

  export const commands = {
    setIcon: `${extentionId}.setIcon`,
    setIconPath: `${extentionId}.setIconPath`,
    setShortcutPath: `${extentionId}.setShortcutPath`,
    findShortcut: `${extentionId}.findShortcut`,
  };
  export const configKeys = {
    iconPath: "iconPath",
    shortcutPath: "shortcutPath",
    promptOnActivate: "promptOnActivate",
  };
