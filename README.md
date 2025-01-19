# VSC Icon

This extension changes the shortcut icon of your Visual Studio Code (User Install) to an icon you like.
If you have a custom icon for VS Code, it will be reverted to the default icon.

## Requirement
- Windows installation
- User Install of VS Code
- powershell

## Guide

### Set the icon path

1. When the extension is the first time activated, you get a pop-up to set the icon of VS Code.
2. After that, you can enter the path of a .ico-file you wish to set as the icon of VS Code. 
<br> *You can also use the `Set Icon Path` command.*
3. When you pressed `Enter` the extension will check the path and set the icon.
4. *If the progress was successful, you can restart VS Code to see the new icon in the taskbar*

### Set the shortcut path

> The extention automaticly sets this path to the default path where VS Code has created the shortcut.
<br> **Use this if you have renamed or moved your start menu shortcut of VS Code.**

1. Run the `Set Shortcut Path` command
2. Enter the path of the shortcut for Visual Studio Code.
    - To find the Shortcut, open the Windows start menu. Search "Visual Studio Code" in the Search bar. Right-click on the item for VS Code and click on "Open file location". Copy the file location of the selected Shortcut item and paste it in the input box of the extension.

### If the icon is reverted

- Use the `Set Icon` command to set the icon again.


## Commands

- `Set Icon Path`
    - Set the path of a .ico-file you wish to see as the VS Code Icon
    - Sets the given path as icon.
- `Set Shortcut Path`: 
    - Set the path to the path of the VS Code shortcut.
- `Set Icon`
    - Sets the icon of Visual Studio Code.

> To run an extention command press `Strg + p` and type the command in the input box.

## Executed commands
- Get the path of the running VS Code process
- Get the data (e.g. target path, hotkeys, arguments) of a .lnk-file *(only target path is used)*
- Set the icon of a .lnk-file