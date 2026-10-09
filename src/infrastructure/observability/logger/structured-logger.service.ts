import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

@Injectable()
export class StructuredLoggerService implements LoggerService {
  private formatMessage(level: string, message: any, context?: string, meta?: any) {
    const logObject = {
      timestamp: new Date().toISOString(),
      level,
      context: context || 'Application',
      message: typeof message === 'object' ? JSON.stringify(message) : message,
      ...(meta && { meta }),
    };
    return JSON.stringify(logObject);
  }

  log(message: any, context?: string) {
    console.log(this.formatMessage('INFO', message, context));
  }

  error(message: any, trace?: string, context?: string) {
    console.error(this.formatMessage('ERROR', message, context, { trace }));
  }

  warn(message: any, context?: string) {
    console.warn(this.formatMessage('WARN', message, context));
  }

  debug(message: any, context?: string) {
    console.debug(this.formatMessage('DEBUG', message, context));
  }

  verbose(message: any, context?: string) {
    console.log(this.formatMessage('VERBOSE', message, context));
  }
}
