// Log levels
export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

// Logger class
class Logger {
    private level: LogLevel = LogLevel.INFO;
    private prefix: string = '[AplifyAI]';

    setLevel(level: LogLevel) {
        this.level = level;
    }

    setPrefix(prefix: string) {
        this.prefix = prefix;
    }

    private shouldLog(level: LogLevel): boolean {
        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        return levels.indexOf(level) >= levels.indexOf(this.level);
    }

    private formatMessage(level: LogLevel, message: string, meta?: any): string {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
        return `${this.prefix} [${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
    }

    debug(message: string, meta?: any) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
        }
    }

    info(message: string, meta?: any) {
        if (this.shouldLog(LogLevel.INFO)) {
            console.info(this.formatMessage(LogLevel.INFO, message, meta));
        }
    }

    warn(message: string, meta?: any) {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(this.formatMessage(LogLevel.WARN, message, meta));
        }
    }

    error(message: string, meta?: any) {
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error(this.formatMessage(LogLevel.ERROR, message, meta));
        }
    }
}

export const logger = new Logger();
export { Logger };
