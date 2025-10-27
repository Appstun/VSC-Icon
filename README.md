If you have a custom icon for VS Code, it will be reverted to the default icon when you install an update.
This extension sets the Visual Studio Code shortcut icon to an icon you choose and restores it after an update.

## Requirements

- Windows
- PowerShell

## Guide

### Set the icon path

1. When the extension is activated for the first time, you will get a pop-up to set the VS Code icon.
2. After that, you can enter the path to a .ico file you wish to use as the VS Code icon.
   _You can also use the `Set Icon Path` command._
3. After you press `Enter`, the extension will check the path and set the icon.
4. If the operation succeeds, restart VS Code to see the new icon in the taskbar.

### Set the shortcut path

> The extension automatically uses the default path where VS Code created the shortcut.
> **Use this if you renamed or moved your VS Code Start Menu shortcut.**

0. You can try the `Find Shortcut` command if VS Code is installed system-wide.
1. Run the `Set Shortcut Path` command.
2. Enter the path to the Visual Studio Code shortcut.
   - To find the shortcut: open the Windows Start menu, search for "Visual Studio Code", right-click the item and select "Open file location". Copy the file location of the shortcut and paste it into the extension's input box.

### If the icon is reverted

- Use the `Set Icon` command to set the icon again.

## Commands

- `VSC Icon Menu`
  - A menu for selecting and running the other commands. It also shows what is wrong or what needs to be done.
- `Set Icon Path`
  - Set the path to a .ico file you wish to use as the VS Code icon.
- `Set Shortcut Path`
  - Set the path to the VS Code shortcut.
- `Set Icon`
  - Sets the icon for VS Code.
- `Find Shortcut`
  - Searches for the VS Code shortcut in the system and user Start Menu folders. If it finds the shortcut in the system Start Menu folder, it copies it to the user's Start Menu folder so the icon can be changed. If it can't find a shortcut, the user can set the path manually.

> To run an extension command press `Ctrl + Shift + P` and type the command in the input box.

## Used PowerShell commands

- Get the path of the running VS Code process.
- Get data from a .lnk file (e.g. target path, hotkeys, arguments) — only the target path is used.
- Set the icon of a .lnk file.

You can view all PowerShell commands here: https://github.com/Appstun/VSC-Icon/blob/main/src/powershell.ts

### Other system things

The extension also checks whether paths exist and copies files/folders (for example, the system Start Menu folder of VS Code to the user's Start Menu folder). See https://github.com/Appstun/VSC-Icon/blob/main/src/FileManager.ts#L102C9-L106C71.

[Appstun](https://github.com/appstun) - Developer
