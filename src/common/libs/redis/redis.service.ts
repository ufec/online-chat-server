import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';
import type Redis from 'ioredis';

@Injectable()
export class RedisClientService {
  private readonly client: Redis;

  constructor(private readonly redisService: RedisService) {
    this.client = this.redisService.getClient();
  }

  /**
   * 获取Redis客户端
   * @returns
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * 获取缓存
   * @param key 键
   * @returns
   */
  async get(key: string): Promise<string | null> {
    if (key === '' || key === '*') {
      return null;
    }
    return await this.client.get(key);
  }

  /**
   * 设置缓存
   * @param key 键
   * @param value 值
   * @param seconds 过期时间，单位秒
   * @returns
   */
  async set(key: string, value: string, seconds?: number | string): Promise<'OK' | null> {
    if (seconds === undefined) {
      return await this.client.set(key, value);
    } else {
      return await this.client.set(key, value, 'EX', seconds);
    }
  }

  /**
   * 删除缓存
   * @param key 键
   * @returns
   * @example
   */
  async del(key: string | string[]): Promise<number> {
    if (key === '' || key === '*') {
      return 0;
    }
    if (typeof key === 'string') {
      return await this.client.del(key);
    }
    return await this.client.del(...key);
  }

  /**
   * 判断缓存是否存在
   * @param key 键
   * @returns
   */
  async exists(key: string): Promise<number> {
    if (key === '' || key === '*') {
      return 0;
    }
    return await this.client.exists(key);
  }

  /**
   * 设置过期时间
   * @param key 键
   * @param seconds 过期时间，单位秒
   * @returns
   */
  async expire(key: string, seconds: number): Promise<number> {
    if (key === '' || key === '*') {
      return 0;
    }
    return await this.client.expire(key, seconds);
  }

  /**
   * 获取过期时间
   * @param key 键
   * @returns
   */
  async ttl(key: string): Promise<number> {
    if (key === '' || key === '*') {
      return 0;
    }
    return await this.client.ttl(key);
  }

  /**
   * 获取所有键
   * @returns
   */
  async keys(): Promise<string[]> {
    return await this.client.keys('*');
  }

  /**
   * 清空缓存
   * @returns
   */
  async flushAll(): Promise<'OK'> {
    return await this.client.flushall();
  }
}
