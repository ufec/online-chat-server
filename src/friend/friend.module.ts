import { Module, forwardRef } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsEntity } from './entities/Friends.entity';
import { FriendRequestsEntity } from './entities/FriendRequests.entity';
import { ChannelsModule } from '@/channels/channels.module';
import { UserModule } from '@/user/user.module';
import { MessageModule } from '@/message/message.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendsEntity, FriendRequestsEntity]),
    forwardRef(() => UserModule),
    forwardRef(() => ChannelsModule),
    forwardRef(() => MessageModule),
  ],
  providers: [FriendService],
  controllers: [FriendController],
  exports: [FriendService, TypeOrmModule],
})
export class FriendModule {}
