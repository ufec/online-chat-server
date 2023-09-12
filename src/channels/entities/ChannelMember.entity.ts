import { BaseEntity } from '@/common/entities/Base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ChannelEntity } from './Channel.entity';
import { type PublicUserInfoDto } from '@/user/dto/user.dto';

@Entity('channel_member')
@Index(['channelId', 'memberId'], { unique: true }) // 联合索引
export class ChannelMemberEntity extends BaseEntity {
  @PrimaryColumn({
    type: 'varchar',
    name: 'channel_id',
    comment: '频道id',
  })
  channelId!: string;

  @PrimaryColumn({
    type: 'int',
    name: 'member_id',
    unsigned: true,
    unique: true,
    comment: '频道成员id',
  })
  memberId!: number;

  @Column({
    type: 'tinyint',
    name: 'role',
    default: 0,
    nullable: false,
    comment: '频道成员角色名称, 0:普通成员 1:管理员 2:群主',
  })
  role!: number;

  @Column({
    type: 'varchar',
    name: 'alias_channel_name',
    length: 50,
    nullable: true,
    default: null,
    comment: '成员对频道起的别名',
  })
  aliasChannelName!: string;

  @Column({
    type: 'varchar',
    name: 'alias_member_name',
    length: 50,
    nullable: true,
    default: null,
    comment: '成员在频道中的别名',
  })
  aliasMemberName!: string;

  // 这个冗余字段的意义：此表中存储了用户id与channelid的映射，但是用户可以在很多频道，即使我们可以设置好友、群聊上限
  // 但这个冗余字段可以帮我们排除其他类型的频道
  @Column({
    type: 'tinyint',
    name: 'channel_type',
    unsigned: true,
    default: 0,
    comment: '频道类型 0:好友 1:群组',
  })
  channelType!: number;

  // 多个频道成员对应一个频道
  @ManyToOne(() => ChannelEntity, (channel) => channel.channelMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'channel_id', referencedColumnName: 'id' })
  channel!: ChannelEntity;

  member?: PublicUserInfoDto;
}
