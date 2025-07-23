import * as vscode from "vscode";
import { Config } from "./config";

export type MessageType = "warning" | "info" | "error";
export namespace MessageManager {
  export class ProgressMessage {
    private progress: vscode.Progress<{ message?: string; increment?: number }> | undefined;
    private token: vscode.CancellationToken | undefined;
    private currentPercentage: number = 0;
    private finished: boolean = false;
    private lastMessage: string | undefined = undefined;

    constructor(text?: { title?: string; firstMessage?: string }, cancel?: { cancellable?: boolean; directly?: boolean }) {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          cancellable: cancel?.cancellable ? cancel.cancellable : false,
          title: text?.title,
        },
        (progress, token) => {
          this.progress = progress;
          this.token = token;

          if (text?.firstMessage) {
            progress.report({ message: text.firstMessage });
          }

          return new Promise<void>((resolve) => {
            let interval = setInterval(() => {
              if (this.finished || (token.isCancellationRequested && cancel?.directly)) {
                resolve();
                clearInterval(interval);
              }
            }, 1);
          });
        }
      );
    }

    public setProgress(message?: string, percentage?: number) {
      if (!this.progress) {
        return;
      }

      let increment = percentage ? percentage - this.currentPercentage : undefined;
      this.progress.report({ message: message ? message : this.lastMessage, increment });
    }

    public finish() {
      this.finished = true;
    }

    public onCancel(callback: () => void) {
      if (!this.token) {
        return;
      }
      this.token.onCancellationRequested(callback);
    }

    public waitMiliseconds(ms: number) {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, ms);
      });
    }
  }

  export async function showMessage<T extends string>(
    text: { type: MessageType; message: string } | string,
    options?: vscode.MessageOptions
  ): Promise<undefined>;
  export async function showMessage<T extends string>(
    text: { type: MessageType; message: string } | string,
    options?: vscode.MessageOptions,
    items?: T[]
  ): Promise<T | undefined>;
  export async function showMessage<T extends string>(
    text: { type: MessageType; message: string } | string,
    options?: vscode.MessageOptions,
    items?: T[]
  ): Promise<T | undefined> {
    let data = typeof text === "string" ? { type: "info" as MessageType, message: text } : text;
    items = items || [];

    if (options === undefined) {
      switch (data.type) {
        case "error":
          return await vscode.window.showErrorMessage(data.message, ...items);
        case "warning":
          return await vscode.window.showWarningMessage(data.message, ...items);
        case "info":
          return await vscode.window.showInformationMessage(data.message, ...items);
      }
    } else {
      switch (data.type) {
        case "error":
          return await vscode.window.showErrorMessage(data.message, options, ...items);
        case "warning":
          return await vscode.window.showWarningMessage(data.message, options, ...items);
        case "info":
          return await vscode.window.showInformationMessage(data.message, options, ...items);
      }
    }
  }

  export async function showMessageWithName<T extends string>(
    text: { type: MessageType; message: string } | string,
    options?: vscode.MessageOptions
  ): Promise<undefined>;
  export async function showMessageWithName<T extends string>(
    text: { type: MessageType; message: string } | string,
    options?: vscode.MessageOptions,
    items?: T[]
  ): Promise<T | undefined>;
  export async function showMessageWithName<T extends string>(
    text: { type: MessageType; message: string } | string,
    options?: vscode.MessageOptions,
    items?: T[]
  ): Promise<T | undefined> {
    let data = typeof text === "string" ? { type: "info" as MessageType, message: text } : text;
    return showMessage({ type: data.type, message: `${Config.extensionName}: ${data.message}` }, options, items ?? []);
  }

  export async function showQuickPick<T extends string>(items: T[], options?: vscode.QuickPickOptions): Promise<number | undefined>;
  export async function showQuickPick<T extends string>(
    items: T[],
    options: vscode.QuickPickOptions & { canPickMany: true }
  ): Promise<number[] | undefined>;
  export async function showQuickPick<T extends string>(
    items: T[],
    options?: vscode.QuickPickOptions
  ): Promise<number[] | number | undefined> {
    const result = (await vscode.window.showQuickPick(items, options)) as T[] | T | undefined;
    if (result === undefined) {
      return undefined;
    }
    if (Array.isArray(result)) {
      return result.map((item) => items.indexOf(item));
    }
    return items.indexOf(result);
  }
}
