import { BaseEntity } from '@/common/entities/Base.entity';
import { Column, Entity, PrimaryColumn, Index, OneToMany, JoinColumn } from 'typeorm';
import { ChannelMemberEntity } from './ChannelMember.entity';

@Entity('channel')
export class ChannelEntity extends BaseEntity {
  @PrimaryColumn({ type: 'varchar', name: 'id', unique: true, comment: '频道id' })
  @Index({ unique: true })
  id!: string;

  @Column({
    type: 'varchar',
    name: 'channel_name',
    length: 50,
    nullable: true,
    default: null,
    comment: '频道默认名称',
  })
  channelName!: string;

  // 如果是群组，那么这个字段就是群组的头像，如果是好友，那么这个字段就直接留空，前端可以根据好友的头像来显示
  @Column({
    type: 'varchar',
    name: 'channel_avatar',
    length: 255,
    nullable: true,
    default: null,
    comment: '频道默认头像',
  })
  avatar!: string;

  @Column({
    type: 'tinyint',
    name: 'channel_type',
    unsigned: true,
    default: 0,
    comment: '频道类型 0:好友 1:群组',
  })
  channelType!: number;

  @Column({
    type: 'varchar',
    name: 'last_message_id',
    length: 30,
    nullable: true,
    default: null,
    comment: '最后一条消息的id',
  })
  lastMessageId?: string;

  // 这个字段在部分场景很有用，有了这个字段其实就能区分单聊和群聊，但还有个私聊的场景
  @Column({
    comment:
      '好友关系的唯一标识(由owner_user_id和friend_user_id按照大小顺序拼接而成)，频道类型为0时有效',
    type: 'varchar',
    length: 255,
    default: '',
    name: 'friend_unique_id',
  })
  friendUniqueId?: string;

  // 一个频道可以有多个成员
  @OneToMany(() => ChannelMemberEntity, (channelMember) => channelMember.channel, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id', referencedColumnName: 'channel_id' })
  channelMembers!: ChannelMemberEntity[];
}
