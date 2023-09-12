import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './common/config';
import { RedisClientModule } from './common/libs/redis/redis.module';
import { type RedisModuleOptions } from 'nestjs-redis';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { type DatabaseType, type DataSourceOptions } from 'typeorm';
import { FriendModule } from './friend/friend.module';
import { FileModule } from './file/file.module';
import { ChannelsModule } from './channels/channels.module';
import { MessageModule } from './message/message.module';
import { AttachmentModule } from './attachment/attachment.module';

@Module({
  imports: [
    // config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true,
    }),
    // orm
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        const dbtype = config.get<DatabaseType>('app.dbtype') ?? 'mysql';
        return {
          type: dbtype,
          keepConnectionAlive: true,
          autoLoadEntities: true, // 自动加载模块中注册的entity
          ...config.get<DataSourceOptions>(`db.${dbtype}`),
        };
      },
    }),
    // redis
    RedisClientModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('redis') as RedisModuleOptions,
    }),
    AuthModule,
    ChatModule,
    UserModule,
    FriendModule,
    FileModule,
    ChannelsModule,
    MessageModule,
    AttachmentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
