import { forwardRef, Global, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { UserModule } from 'src/user/user.module';
import { FriendModule } from 'src/friend/friend.module';
import { ChannelsModule } from '@/channels/channels.module';

@Global()
@Module({
  imports: [FriendModule, forwardRef(() => UserModule), forwardRef(() => ChannelsModule)],
  providers: [ChatGateway, ChatService],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
