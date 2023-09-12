import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from './entities/User.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ChatModule } from 'src/chat/chat.module';
import { FriendModule } from 'src/friend/friend.module';
import { FriendService } from '@/friend/friend.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secretKey'),
        signOptions: {
          expiresIn: config.get('jwt.expiresIn'),
          issuer: config.get('jwt.issuer'),
        },
      }),
    }),
    forwardRef(() => AuthModule),
    forwardRef(() => ChatModule),
    forwardRef(() => FriendModule),
  ],
  controllers: [UserController],
  providers: [UserService, FriendService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
