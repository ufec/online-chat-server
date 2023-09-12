import type {
  MsgTypeEnum,
  MsgStatusEnum,
  MsgFromTypeEnum,
  MsgIsApplyEnum,
  MsgIsReplyEnum,
} from './constants';

export interface SendMsgOptions {
  content: string;
  msgType: MsgTypeEnum;
  msgStatus: MsgStatusEnum;
  msgFromType: MsgFromTypeEnum;
  isApply: MsgIsApplyEnum;
  isReply: MsgIsReplyEnum;
}
