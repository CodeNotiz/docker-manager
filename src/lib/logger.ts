/**
 * Centralized logger for Docker Manager
 *
 * Log level is controlled via the LOG_LEVEL environment variable.
 * Supported levels (in order of verbosity):
 *   DEBUG | INFO | WARN | ERROR | SILENT
 *
 * Default: INFO
 *
 * Example:
 *   LOG_LEVEL=DEBUG   → all messages
 *   LOG_LEVEL=ERROR   → only errors
 *   LOG_LEVEL=SILENT  → no output
 */

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "SILENT";

const LEVELS: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4,
};

const COLORS: Record<LogLevel, string> = {
  DEBUG: "\x1b[36m", // Cyan
  INFO:  "\x1b[32m", // Green
  WARN:  "\x1b[33m", // Yellow
  ERROR: "\x1b[31m", // Red
  SILENT: "",
};
const RESET = "\x1b[0m";

function getConfiguredLevel(): number {
  const raw = (process.env.LOG_LEVEL ?? "INFO").toUpperCase() as LogLevel;
  return LEVELS[raw] ?? LEVELS.INFO;
}

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

function log(level: LogLevel, ...args: unknown[]): void {
  if (LEVELS[level] < getConfiguredLevel()) return;
  const color = COLORS[level];
  const prefix = `${color}[${timestamp()}] [${level.padEnd(5)}]${RESET}`;
  if (level === "ERROR" || level === "WARN") {
    console.error(prefix, ...args);
  } else {
    console.log(prefix, ...args);
  }
}

export const logger = {
  debug: (...args: unknown[]) => log("DEBUG", ...args),
  info:  (...args: unknown[]) => log("INFO",  ...args),
  warn:  (...args: unknown[]) => log("WARN",  ...args),
  error: (...args: unknown[]) => log("ERROR", ...args),
};

export default logger;
