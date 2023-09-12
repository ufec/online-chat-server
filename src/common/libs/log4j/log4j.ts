import { type Configuration } from 'log4js';
import { normalize, isAbsolute, join } from 'node:path';
import parseConfigFile from '../../config';

const loggerConfig = parseConfigFile().app.logger; // 获取配置文件中的日志配置

const logDir = normalize(
  isAbsolute(loggerConfig.dir) ? loggerConfig.dir : join(process.cwd(), loggerConfig.dir)
); // 日志文件存储目录

export enum LogLevel {
  ALL = 'ALL', // 所有日志
  MARK = 'MARK', // 自定义日志级别
  TRACE = 'TRACE', // 详细的日志信息
  DEBUG = 'DEBUG', // 记录程序中的调试信息
  INFO = 'INFO', // 正常运行时的信息 不应该过多
  WARN = 'WARN', // 警告 系统可能出现问题
  ERROR = 'ERROR', // 错误日志 影响客户正常使用
  FATAL = 'FATAL', // 致命错误 一个生命周期内只应该打印一次
  OFF = 'OFF', // 关闭日志
}

// 日志配置
export const Log4jsConfig: Configuration = {
  // Log4j 输出源
  appenders: {
    // 控制台输出源
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%[[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] [%c] -%] %m',
      },
    },
    // access 日志输出源
    access: {
      type: 'dateFile',
      filename: `${logDir}/access/access.log`,
      pattern: 'yyyy-MM-dd',
      alwaysIncludePattern: true,
      compress: true,
      layout: {
        type: 'pattern',
        pattern: '%[[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] [%c] -%] %m',
      },
    },
    // App运行日志输出源
    app: {
      type: 'dateFile',
      filename: `${logDir}/app/app.log`,
      pattern: 'yyyy-MM-dd',
      alwaysIncludePattern: true,
      keepFileExt: true,
      daysToKeep: loggerConfig.daysToKeep,
      numBackups: loggerConfig.numBackups,
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] [%c] - %m',
      },
    },
    // 异常日志输出源
    errors: {
      type: 'dateFile',
      filename: `${logDir}/error/errors.log`,
      pattern: 'yyyy-MM-dd',
      alwaysIncludePattern: true,
      keepFileExt: true,
      daysToKeep: loggerConfig.daysToKeep,
      numBackups: loggerConfig.numBackups,
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] [%c] - %m',
      },
    },
    // 错误等级日志过滤器
    errorFilter: {
      type: 'logLevelFilter',
      appender: 'errorFile',
      level: LogLevel.ERROR,
    },
  },
  // 日志输出级别, 低于该级别的日志不会输出, 也可以配置多个日志输出的级别, 比如控制台输出和文件输出的级别不同
  categories: {
    default: {
      appenders: ['console', 'app', 'errors'],
      level: LogLevel.TRACE,
    },
    database: {
      appenders: ['app', 'errors'],
      level: LogLevel.INFO,
    },
    access: {
      appenders: ['access'],
      level: LogLevel.INFO,
    },
  },
};

// export const JsonLayout = (logConf: any) => {
//   return (logEvent: LoggingEvent): string => {
//     const messageList: string[] = [];
//     logEvent.data.forEach((item) => {
//       if (item instanceof ) {

//       }
//     });
//   };
// };
