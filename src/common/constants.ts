export const DEFAULT_SLOGAN = '这个人很懒，什么都没有留下';

export const DEFAULT_GENDER = 0;

export const DEFAULT_APPLY_MSG = '请求添加你为好友';

export const DEFAULT_ACCEPT_MSG = '我通过了你的朋友验证请求，现在我们可以开始聊天了';

export enum FriendRequestsStatusEnum {
  PENDING = 0,
  ACCEPTED = 1,
  REJECTED = 2,
}

export enum FriendRequestsTypeEnum {
  WEB = 0,
}

export enum GenderEnum {
  MALE = 0,
  FEMALE = 1,
  UNKNOWN = 2,
}

export const ONLINE_USER_REDIS_KEY_PREFIX = 'online_user_';

export enum MsgTypeEnum {
  TEXT = 1,
  IMAGE = 2,
  AUDIO = 3,
  VIDEO = 4,
  FILE = 5,
  LOCATION = 6,
  CARD = 7,
  SHARE = 8,
  SYSTEM = 9,
  RECALL = 10,
  NOTICE = 11,
  PDF = 12,
}

export enum MsgStatusEnum {
  UNREAD = 1,
  READ = 2,
  RECALL = 3,
  DELETE = 4,
}

export enum MsgFromTypeEnum {
  USER = 0,
  GROUP = 1,
  SYSTEM = 2,
}

export enum MsgIsApplyEnum {
  NO = 0,
  YES = 1,
}

export enum MsgIsReplyEnum {
  NO = 0,
  YES = 1,
}
