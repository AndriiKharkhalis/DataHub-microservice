import { ILogger } from "../domain";

export class Logger implements ILogger {
  info(message: string, ...optionalParams: unknown[]) {
    this.log("INFO", message, ...optionalParams);
  }

  warn(message: string, ...optionalParams: unknown[]) {
    this.log("WARN", message, ...optionalParams);
  }

  error(message: string, ...optionalParams: unknown[]) {
    this.log("ERROR", message, ...optionalParams);
  }

  private log(level: string, message: string, ...optionalParams: unknown[]) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`, ...optionalParams);
  }
}
