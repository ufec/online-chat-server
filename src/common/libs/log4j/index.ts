/* eslint-disable @typescript-eslint/no-unsafe-argument */
import * as Log4js from 'log4js';
import * as stackTrace from 'stacktrace-js';
import { Log4jsConfig } from './log4j';

Log4js.configure(Log4jsConfig);

const logger = Log4js.getLogger('default');
const databaseLogger = Log4js.getLogger('database');
const accessLogger = Log4js.getLogger('access');

class BaseLogger {
  constructor(private readonly _name = 'BaseLogger') {}
  // 打印堆栈信息
  static getStackTrace(deep = 2): string {
    const stackList = stackTrace.getSync();
    if (deep > stackList.length) {
      deep = stackList.length;
    }
    const stackInfo = stackList[deep];
    return `at ${stackInfo.functionName ?? ''} (${stackInfo.fileName ?? ''}:${
      stackInfo.lineNumber ?? ''
    }:${stackInfo.columnNumber ?? ''})`;
  }
}

export class DefaultLogger extends BaseLogger {
  static trace(...args: any[]): void {
    logger.trace(super.getStackTrace.bind(this), ...args);
  }

  static debug(message: string, ...args: any[]): void {
    logger.debug(message, ...args);
  }

  static info(message: string, ...args: any[]): void {
    logger.info(message, ...args);
  }

  static warn(message: string, ...args: any[]): void {
    logger.warn(message, ...args);
  }

  static error(message: string, ...args: any[]): void {
    logger.error(message, ...args);
  }

  static fatal(message: string, ...args: any[]): void {
    logger.fatal(message, ...args);
  }
}

export class DatabaseLogger extends BaseLogger {
  static trace(...args: any[]): void {
    databaseLogger.trace(super.getStackTrace.bind(this), ...args);
  }

  static debug(message: string, ...args: any[]): void {
    databaseLogger.debug(message, ...args);
  }

  static info(message: string, ...args: any[]): void {
    databaseLogger.info(message, ...args);
  }

  static warn(message: string, ...args: any[]): void {
    databaseLogger.warn(message, ...args);
  }

  static error(message: string, ...args: any[]): void {
    databaseLogger.error(message, ...args);
  }

  static fatal(message: string, ...args: any[]): void {
    databaseLogger.fatal(message, ...args);
  }
}

export class AccessLogger extends BaseLogger {
  static trace(...args: any[]): void {
    accessLogger.trace(super.getStackTrace.bind(this), ...args);
  }

  static debug(message: string, ...args: any[]): void {
    accessLogger.debug(message, ...args);
  }

  static info(message: string, ...args: any[]): void {
    accessLogger.info(message, ...args);
  }

  static warn(message: string, ...args: any[]): void {
    accessLogger.warn(message, ...args);
  }

  static error(message: string, ...args: any[]): void {
    accessLogger.error(message, ...args);
  }

  static fatal(message: string, ...args: any[]): void {
    accessLogger.fatal(message, ...args);
  }
}
