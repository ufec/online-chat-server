import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as yaml from 'js-yaml';
import type { DatabaseType, DataSourceOptions } from 'typeorm';
// 配置文件缩写
const configFileTypeMap = {
  development: 'dev',
  production: 'prod',
  test: 'test',
};
type NODE_ENV = keyof typeof configFileTypeMap;
// 构建环境
const env = (process.env.NODE_ENV ?? 'development') as NODE_ENV;
const filePath = join(__dirname, `${configFileTypeMap[env]}.yaml`);

export interface LoggerConfig {
  dir: string; // 日志目录
  daysToKeep: number; // 日志保留天数
  numBackups: number; // 日志保留数量
}

export interface AppConfig {
  prefix: string; // 路由前缀
  port: number; // 端口
  logger: LoggerConfig; // 日志配置
  dbtype: DatabaseType; // 数据库类型
}

export type DatabaseConfig = {
  [propName in DatabaseType]: DataSourceOptions;
};

export interface JwtConfig {
  secretKey: string; // jwt密钥
  expiresIn: number; // jwt过期时间
  issuer: string; // jwt签发者
}

export interface RedisConfig {
  host: string; // redis地址
  port: number; // redis端口
  password: string; // redis密码
  db: number; // redis数据库
}

export interface Config {
  app: AppConfig;
  db: DatabaseConfig;
  jwt: JwtConfig;
  redis: RedisConfig;
}

export default () => {
  return yaml.load(readFileSync(filePath, 'utf-8')) as Config;
};
