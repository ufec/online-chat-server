import type {
  MsgFromTypeEnum,
  MsgIsApplyEnum,
  MsgIsReplyEnum,
  MsgStatusEnum,
  MsgTypeEnum,
} from '@/common/constants';

export interface MsgPayload {
  fromUserId: number;
  toUserId: number;
  message: string;
  msgFromType: MsgFromTypeEnum;
  msgType: MsgTypeEnum;
  status: MsgStatusEnum;
  msgId: string;
  createdAt: string;
  isApply: MsgIsApplyEnum;
  isReply: MsgIsReplyEnum;
}
