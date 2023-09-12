import { type AttachmentResultDto } from '@/attachment/dto/result.attachment';
import type {
  MsgFromTypeEnum,
  MsgIsApplyEnum,
  MsgIsReplyEnum,
  MsgStatusEnum,
  MsgTypeEnum,
} from '@/common/constants';
import { BaseEntityDto } from '@/common/dto/common-result.dto';
import { type PublicUserInfoDto } from '@/user/dto/user.dto';

export class MessageResultDto extends BaseEntityDto {
  id!: string;
  channelId!: string;
  authorId!: number;
  content!: string;
  msgType!: MsgTypeEnum;
  msgStatus!: MsgStatusEnum;
  msgFromType!: MsgFromTypeEnum;
  isApply!: MsgIsApplyEnum;
  isReply!: MsgIsReplyEnum;
  messageReferenceId?: string;

  author?: PublicUserInfoDto;
  mentions?: PublicUserInfoDto[];
  attachments?: AttachmentResultDto[];
}

export type ChannelIdMapMessageListDto = Record<string, MessageResultDto[]>;
