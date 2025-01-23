This extension changes the shortcut icon of your Visual Studio Code to an icon you like.
If you have a custom icon for VS Code, it will be reverted to the default icon when you install an update.

## Requirements

- Windows installation
- PowerShell

## Guide

### Set the icon path

1. When the extension is the first time activated, you get a pop-up to set the icon of VS Code.
2. After that, you can enter the path of a .ico-file you wish to set as the icon of VS Code.
  <br> _You can also use the `Set Icon Path` command._
3. When you pressed `Enter` the extension will check the path and set the icon.
4. _If the progress was successful, you can restart VS Code to see the new icon in the taskbar_

### Set the shortcut path

> The extention automaticly sets this path to the default path where VS Code has created the shortcut.
> <br> **Use this if you have renamed or moved your start menu shortcut of VS Code.**

0. You can try the `Find Shortcut` command if you have VS Code system-wide installed.
1. Run the `Set Shortcut Path` command.
2. Enter the path of the shortcut for Visual Studio Code.
   - To find the Shortcut, open the Windows start menu. Search "Visual Studio Code" in the Search bar. Right-click on the item for VS Code and click on "Open file location". Copy the file location of the selected Shortcut item and paste it in the input box of the extension.

### If the icon is reverted

- Use the `Set Icon` command to set the icon again.

## Commands

- `VSC Icon Menu`
  - A Menu for selecting and running the other commands.
- `Set Icon Path`
  - Set the path of a .ico-file you wish to see as the VS Code Icon
  - Sets the given path as icon.
- `Set Shortcut Path`
  - Set the path to the path of the VS Code shortcut
- `Set Icon`
  - Sets the icon of VS Code.
- `Find Shortcut`
  - Tries to find the shortcut of VS Code in the system and user Start Menu folder
  - If it finds the shortcut in the system Start Menu folder, it copies the shortcut to the user Start Menu folder so it can be set.
  - The user can set it manually when it fails to find a shortcut.

> To run an extention command press `Strg + Shift + P` and type the command in the input box.

## Used PowerShell commands

- Get the path of the running VS Code process
- Get the data (e.g. target path, hotkeys, arguments) of a .lnk-file _(only target path is used)_
- Set the icon of a .lnk-file

_You can view all PowerShell commands [here](https://github.com/Appstun/VSC-Icon/blob/main/src/powershell.ts)._
<br><br>

### _Other system things_ 
_The extention also checks if paths exists and copies files / folders (the system Start Menu folder of VS Code to the user Start Menu folder) [[view](https://github.com/Appstun/VSC-Icon/blob/main/src/FileManager.ts#L102C9-L106C71)]._

<br><br><br>

[Appstun](https://github.com/appstun) - Developer
