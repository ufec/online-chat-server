import { type DynamicModule, Global, Module } from '@nestjs/common';
import { type RedisModuleOptions, RedisModule, type RedisModuleAsyncOptions } from 'nestjs-redis';
import { RedisClientService } from './redis.service';

@Global()
@Module({
  providers: [RedisClientService],
  exports: [RedisClientService],
})
export class RedisClientModule {
  static register(options: RedisModuleOptions | RedisModuleOptions[]): DynamicModule {
    return {
      module: RedisClientModule,
      imports: [RedisModule.register(options)],
      providers: [RedisClientService],
      exports: [RedisClientService],
    };
  }

  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    return {
      module: RedisClientModule,
      imports: [RedisModule.forRootAsync(options)],
      providers: [RedisClientService],
      exports: [RedisClientService],
    };
  }
}
