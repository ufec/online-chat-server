import {
  MsgTypeEnum,
  MsgStatusEnum,
  MsgFromTypeEnum,
  MsgIsApplyEnum,
  MsgIsReplyEnum,
} from '@/common/constants';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from 'class-validator';

/**
 * 创建消息dto
 * 必要参数
 *  - channelId 频道id
 *  - authorId 消息发送者id
 *  - content 消息内容
 * 可选参数
 *  - msgType 消息类型
 *  - msgStatus 消息状态
 *  - msgFromType 消息来源类型
 *  - isApply 是否是申请消息
 *  - isReply 是否是回复消息
 */
export class CreateMessageDto {
  @ApiProperty({ description: '频道id', example: 1, type: String })
  @IsNotEmpty({ message: '频道id不能为空' })
  @IsNumberString({}, { message: '频道id必须为数字字符串' })
  channelId!: string;

  @ApiProperty({ description: '消息发送者id', example: 1 })
  @IsNotEmpty({ message: '消息发送者id不能为空' })
  @IsNumber({}, { message: '消息发送者id必须为数字' })
  @IsOptional()
  authorId?: number;

  @ApiProperty({ description: '消息内容', example: '你好' })
  @IsString({ message: '消息内容必须为字符串' })
  content!: string;

  @ApiProperty({
    description:
      '消息类型 1:文本 2:图片 3:语音 4:视频 5:文件 6:位置 7:名片 8:分享 9:系统消息 10:撤回消息 11:通知消息',
    example: MsgTypeEnum.TEXT,
    enum: MsgTypeEnum,
    type: Number,
    default: MsgTypeEnum.TEXT,
  })
  @IsNotEmpty({ message: '消息类型不能为空' })
  @IsNumber({}, { message: '消息类型必须为数字' })
  @IsOptional()
  msgType?: MsgTypeEnum;

  @ApiProperty({
    description: '消息状态 1:未读 2:已读 3:已撤回',
    example: MsgStatusEnum.UNREAD,
    enum: MsgStatusEnum,
    type: Number,
    default: MsgStatusEnum.UNREAD,
  })
  @IsNotEmpty({ message: '消息状态不能为空' })
  @IsNumber({}, { message: '消息状态必须为数字' })
  @IsOptional()
  msgStatus?: MsgStatusEnum;

  @ApiProperty({
    description: '消息来源类型  0:用户消息 1:群消息 2:系统消息',
    example: MsgFromTypeEnum.USER,
    enum: MsgFromTypeEnum,
    type: Number,
    default: MsgFromTypeEnum.USER,
  })
  @IsNotEmpty({ message: '消息来源类型不能为空' })
  @IsNumber({}, { message: '消息来源类型必须为数字' })
  @IsOptional()
  msgFromType?: MsgFromTypeEnum;

  @ApiProperty({
    description: '是否是好友申请消息: 0:不是 1:是',
    example: MsgIsApplyEnum.NO,
    enum: MsgIsApplyEnum,
    type: Number,
    default: MsgIsApplyEnum.NO,
  })
  @IsOptional()
  isApply?: MsgIsApplyEnum;

  @ApiProperty({
    description: '是否是回复申请消息: 0:不是 1:是',
    example: MsgIsReplyEnum.NO,
    enum: MsgIsReplyEnum,
    enumName: 'MsgIsReplyEnum',
    type: Number,
    default: MsgIsReplyEnum.NO,
  })
  @IsOptional()
  isReply?: MsgIsReplyEnum;

  @ApiProperty({ description: '提及的用户id列表', example: [1, 2, 3], type: Array<Number> })
  @IsOptional()
  mentionIds?: number[];

  @ApiProperty({
    description: '是否提及所有人',
    example: false,
    type: Number,
    default: 0,
    enum: [0, 1],
  })
  @IsOptional()
  mentionEveryone?: number;

  @ApiProperty({ description: '附件id列表', example: [1, 2, 3], type: Array<Number> })
  @IsOptional()
  attachmentIds?: string[];

  @ApiProperty({ description: '消息引用id', example: 1, type: String })
  @IsOptional()
  messageReferenceId?: string;
}
