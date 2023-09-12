import { Module, forwardRef } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './entities/Message.entity';
import { SnowflakeService } from '@/common/services/snowflake.service';
import { AttachmentModule } from '@/attachment/attachment.module';
import { UserModule } from '@/user/user.module';
import { ChannelsModule } from '@/channels/channels.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageEntity]),
    AttachmentModule,
    forwardRef(() => UserModule),
    forwardRef(() => ChannelsModule),
  ],
  controllers: [MessageController],
  providers: [
    MessageService,
    {
      provide: SnowflakeService,
      useValue: new SnowflakeService(1, 1),
    },
  ],
  exports: [TypeOrmModule, MessageService],
})
export class MessageModule {}
