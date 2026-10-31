import fs from "fs";
import path from "path";

export interface SystemErrorLog {
  id: string;
  timestamp: string;
  level: "error" | "warn" | "critical";
  source: "server" | "client" | "api" | "boundary";
  message: string;
  stack?: string;
  cause?: string;
  componentStack?: string;
  url?: string;
  context?: Record<string, any>;
  userAgent?: string;
}

const LOGS_FILE = path.join(process.cwd(), "data", "system_errors.json");
const MAX_LOG_ENTRIES = 100;

function ensureLogFile() {
  const dir = path.dirname(LOGS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LOGS_FILE)) {
    fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

function readLogs(): SystemErrorLog[] {
  try {
    ensureLogFile();
    const content = fs.readFileSync(LOGS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Failed to read system errors log file:", err);
    return [];
  }
}

function writeLogsAtomic(logs: SystemErrorLog[]) {
  try {
    ensureLogFile();
    const trimmed = logs.slice(0, MAX_LOG_ENTRIES);
    const tmpFile = `${LOGS_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(trimmed, null, 2), "utf-8");
    fs.renameSync(tmpFile, LOGS_FILE);
  } catch (err) {
    console.error("Failed to write system errors log file:", err);
  }
}

/**
 * Normalizes any caught item (Error, string, DOMException, custom object) into a safe stringifiable error
 */
export function formatErrorDetails(err: unknown): { message: string; stack?: string; cause?: string } {
  if (err instanceof Error) {
    return {
      message: err.message || "Unknown Error",
      stack: err.stack,
      cause: err.cause ? String(err.cause) : undefined,
    };
  }

  if (typeof err === "string") {
    return { message: err };
  }

  if (err && typeof err === "object") {
    try {
      const message = (err as any).message || (err as any).error || JSON.stringify(err);
      const stack = (err as any).stack;
      return { message: String(message), stack: stack ? String(stack) : undefined };
    } catch {
      return { message: "Unserializable error object" };
    }
  }

  return { message: String(err || "Unknown Exception") };
}

/**
 * Logs an error to system diagnostics and prints structured console output
 */
export function logSystemError(
  err: unknown,
  options: {
    source?: "server" | "client" | "api" | "boundary";
    level?: "error" | "warn" | "critical";
    url?: string;
    context?: Record<string, any>;
    componentStack?: string;
    userAgent?: string;
  } = {}
): SystemErrorLog {
  const { message, stack, cause } = formatErrorDetails(err);
  const errorId = `ERR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const entry: SystemErrorLog = {
    id: errorId,
    timestamp: new Date().toISOString(),
    level: options.level || "error",
    source: options.source || "server",
    message,
    stack,
    cause,
    componentStack: options.componentStack,
    url: options.url,
    context: options.context,
    userAgent: options.userAgent,
  };

  // Structured console log for developer visibility
  console.error(
    `\x1b[31m[CLINIC_DIAGNOSTICS] [${entry.id}] [${entry.source.toUpperCase()}]\x1b[0m ${entry.message}`,
    entry.cause ? `\n  Cause: ${entry.cause}` : "",
    options.context ? `\n  Context: ${JSON.stringify(options.context)}` : "",
    stack ? `\n${stack}` : ""
  );

  try {
    const existing = readLogs();
    existing.unshift(entry);
    writeLogsAtomic(existing);
  } catch (logErr) {
    console.error("Secondary failure writing error to disk:", logErr);
  }

  return entry;
}

/**
 * Returns latest system errors for administrative debugging
 */
export function getSystemErrors(limit = 50): SystemErrorLog[] {
  const all = readLogs();
  return all.slice(0, limit);
}

/**
 * Clears logged system errors
 */
export function clearSystemErrors(): void {
  try {
    ensureLogFile();
    fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to clear system errors:", err);
  }
}
