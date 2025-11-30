import AsyncStorage from '@react-native-async-storage/async-storage';

interface LogEntry {
  timestamp: string;
  level: 'log' | 'warn' | 'error';
  message: string;
  source: string;
  stack?: string;
}

class ErrorLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 50;

  constructor() {
    this.setupConsoleOverride();
  }

  private setupConsoleOverride() {
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      originalLog(...args);
      this.addLog('log', args.join(' '), 'console.log');
    };

    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      originalWarn(...args);
      this.addLog('warn', args.join(' '), 'console.warn');
    };

    const originalError = console.error;
    console.error = (...args: any[]) => {
      originalError(...args);
      const message = args
        .map((arg) =>
          arg instanceof Error
            ? `${arg.message}\n${arg.stack}`
            : String(arg)
        )
        .join(' ');
      this.addLog('error', message, 'console.error');
    };

    if (typeof global !== 'undefined') {
      (global as any).onunhandledrejection = (event: any) => {
        this.addLog(
          'error',
          `Unhandled Promise Rejection: ${event.reason}`,
          'unhandledRejection'
        );
      };
    }
  }

  private addLog(
    level: 'log' | 'warn' | 'error',
    message: string,
    source: string,
    stack?: string
  ) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      source,
      stack,
    };

    this.logs.push(logEntry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.saveLogs();
  }

  private async saveLogs() {
    try {
      await AsyncStorage.setItem('@quran_logs', JSON.stringify(this.logs));
    } catch (e) {
      console.error('Failed to save logs:', e);
    }
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  getFormattedLogs(): string {
    return this.logs
      .map(
        (log) =>
          `[${log.timestamp}] ${log.level.toUpperCase()} (${log.source}): ${log.message}`
      )
      .join('\n');
  }

  clearLogs() {
    this.logs = [];
    AsyncStorage.removeItem('@quran_logs');
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const errorLogger = new ErrorLogger();
