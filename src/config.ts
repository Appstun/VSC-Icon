export namespace Config {
  export const extentionId = "vscIcon";
  export const extensionName = "VSC Icon";

  export const commands = {
    setIcon: `${extentionId}.setIcon`,
    setIconPath: `${extentionId}.setIconPath`,
    setShortcutPath: `${extentionId}.setShortcutPath`,
    findShortcut: `${extentionId}.findShortcut`,
  };
  export const globalState = {
    iconPath: "ico.iconPath",
    shortcutPath: "ico.shortcutPath",
    promptOnActivate: "ico.promptOnActivate",
    vscVersion: "vsc.version",
  };

  export const paths = {
    vscUser: `${process.env.APPDATA}\\Microsoft\\Windows\\Start Menu\\Programs\\Visual Studio Code\\Visual Studio Code.lnk`,
    vscSystem: `${process.env.ProgramData}\\Microsoft\\Windows\\Start Menu\\Programs\\Visual Studio Code\\Visual Studio Code.lnk`,
    usrDesktop: `${process.env.USERPROFILE}\\Desktop`,
    usrStartMenu: `${process.env.APPDATA}\\Microsoft\\Windows\\Start Menu\\Programs`,
  };
}
