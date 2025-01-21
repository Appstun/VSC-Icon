import * as vscode from "vscode";
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
}
