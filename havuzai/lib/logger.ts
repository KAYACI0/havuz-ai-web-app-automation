export type LogLevel = "info" | "success" | "error";

export interface LogEntry {
  id:        string;
  timestamp: string;
  level:     LogLevel;
  step:      string;
  message:   string;
  data?:     unknown;
}

// In-memory log store (process ömrü boyunca yaşar, dev'de yeterli)
const logs: LogEntry[] = [];
const MAX_LOGS = 200;

export function log(level: LogLevel, step: string, message: string, data?: unknown) {
  const entry: LogEntry = {
    id:        crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    level,
    step,
    message,
    data,
  };
  logs.unshift(entry); // en yeni başa
  if (logs.length > MAX_LOGS) logs.pop();

  // Terminal'e de yaz
  const prefix = level === "error" ? "❌" : level === "success" ? "✅" : "ℹ️";
  console.log(`${prefix} [${step}] ${message}`, data ?? "");
}

export function getLogs() {
  return [...logs];
}

export function clearLogs() {
  logs.length = 0;
}
