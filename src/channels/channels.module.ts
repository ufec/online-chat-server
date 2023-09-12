import { Module, forwardRef } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelEntity } from './entities/Channel.entity';
import { ChannelMemberEntity } from './entities/ChannelMember.entity';
import { SnowflakeService } from '@/common/services/snowflake.service';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelEntity, ChannelMemberEntity]),
    forwardRef(() => UserModule),
  ],
  controllers: [ChannelsController],
  providers: [
    ChannelsService,
    {
      provide: SnowflakeService,
      useValue: new SnowflakeService(1, 2),
    },
  ],
  exports: [TypeOrmModule, ChannelsService],
})
export class ChannelsModule {}
