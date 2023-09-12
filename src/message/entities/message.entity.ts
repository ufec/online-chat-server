import { type AttachmentEntity } from '@/attachment/entities/Attachment.entity';
import { MsgTypeEnum, MsgStatusEnum, MsgFromTypeEnum } from '@/common/constants';
import { BaseEntity } from '@/common/entities/Base.entity';
import { type PublicUserInfoDto } from '@/user/dto/user.dto';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('message')
export class MessageEntity extends BaseEntity {
  /**
   * 消息id
   */
  @PrimaryColumn({
    type: 'varchar',
    unique: true,
    nullable: false,
    comment: '消息id',
  })
  id!: string;

  @Column({
    name: 'channel_id',
    type: 'varchar',
    nullable: false,
    comment: '频道id',
  })
  channelId!: string;

  @Column({ name: 'author_id', type: 'int', nullable: false, unsigned: true, comment: '发送者id' })
  authorId!: number;

  // TODO:这个字段已经没有必要了
  // 群聊场景下，没有固定的接收者，接收者是群聊的所有成员
  // 私聊场景下，接收者是固定的，可以直接通过fromId和toId来判断消息的接收者，因为此时channel里只有两个人
  // @Column({ name: 'to_id', type: 'int', nullable: false, unsigned: true, comment: '接收者id' })
  // toId!: number;

  @Column({ name: 'content', type: 'text', nullable: false, comment: '消息内容' })
  content!: string;

  @Column({
    name: 'msg_type',
    type: 'tinyint',
    nullable: false,
    unsigned: true,
    default: MsgTypeEnum.TEXT,
    comment:
      '消息类型 1:文本 2:图片 3:语音 4:视频 5:文件 6:位置 7:名片 8:分享 9:系统消息 10:撤回消息 11:通知消息',
  })
  msgType!: number;

  @Column({
    name: 'msg_status',
    type: 'tinyint',
    nullable: false,
    unsigned: true,
    default: MsgStatusEnum.UNREAD,
    comment: '消息状态 1:未读 2:已读 3:已撤回 4:已删除',
  })
  msgStatus!: number;

  @Column({
    type: 'tinyint',
    nullable: false,
    name: 'msg_from_type',
    comment: '消息来源类型  0:用户消息 1:群消息 2:系统消息',
    unsigned: true,
    default: MsgFromTypeEnum.USER,
  })
  msgFromType!: number;

  @Column({
    type: 'tinyint',
    nullable: false,
    default: 0,
    name: 'is_apply',
    comment:
      '是否是好友申请消息: 0:不是 1:是(接受好友申请消息时，接收方也得给发送方发送一条消息，并且is_apply=1)',
    unsigned: true,
  })
  isApply!: number; // 是否是好友申请消息

  @Column({
    type: 'tinyint',
    nullable: false,
    default: 0,
    name: 'is_reply',
    comment: '是否是回复申请消息: 0:不是 1:是',
    unsigned: true,
  })
  isReply!: number; // 是否是回复消息

  @Column({
    name: 'mention_user_ids',
    type: 'text',
    nullable: true,
    comment: '提及的用户id列表',
  })
  mentionUserIds?: string;

  @Column({
    name: 'mention_everyone',
    type: 'tinyint',
    nullable: false,
    default: 0,
    comment: '是否提及所有人, 0:不是 1:是',
  })
  mentionEveryone?: number;

  @Column({
    name: 'message_reference_id',
    type: 'varchar',
    nullable: true,
    comment: '引用的消息id',
  })
  messageReferenceId?: string;

  @Column({
    name: 'attachment_ids',
    type: 'text',
    nullable: true,
    comment: '附件id列表',
  })
  attachmentIds?: string;

  attachments?: AttachmentEntity[];

  mentions?: PublicUserInfoDto[];

  author?: PublicUserInfoDto;
}
