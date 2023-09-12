import { type ChannelEntity } from '@/channels/entities/Channel.entity';
import { type PublicUserInfoDto } from '@/user/dto/user.dto';

export interface ChannelCreateEvent {
  channel: ChannelEntity;
  recipient: PublicUserInfoDto;
  lastMsgId: string | null;
}
