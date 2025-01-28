import { Index } from "./extension";

export namespace Logging {
  export function logger(type: "error" | "info" | "warn", message: any, onlyMessage: boolean = false) {
    let msg = `${!onlyMessage ? `[${new Date().toLocaleTimeString()}] [${type.toUpperCase()}]  ` : ""}${message}`;
    Index.logger.appendLine(msg);
  }
}
