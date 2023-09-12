import type { PublicUserInfoDto } from '@/user/dto/user.dto';
import { CommonEntity } from 'src/common/entities/Common.entity';
import { Column, Entity } from 'typeorm';

@Entity('friend_requests')
export class FriendRequestsEntity extends CommonEntity {
  @Column({
    comment: '发起者id',
    type: 'int',
    unsigned: true,
    name: 'from_user_id',
  })
  fromUserId!: number;

  @Column({
    comment: '接收者id',
    type: 'int',
    unsigned: true,
    name: 'to_user_id',
  })
  toUserId!: number;

  @Column({
    comment: '请求状态: 0待通过 1已通过 2拒绝',
    type: 'tinyint',
    unsigned: true,
    default: 0,
  })
  status!: number;

  @Column({
    comment: '请求类型: 0网页端',
    type: 'tinyint',
    unsigned: true,
    default: 0,
  })
  type!: number;

  @Column({ comment: '验证信息', type: 'text' })
  extra?: string;

  @Column({ comment: '备注信息', type: 'text' })
  remark?: string;

  @Column({ comment: '分组id', type: 'int', unsigned: true, default: 0 })
  groupId?: number;

  // @ManyToOne(() => UserEntity, (user) => user.fromFriendRequests, {
  //   nullable: false, // 一条好友请求必须有一个发起者
  //   onDelete: 'CASCADE', // 删除发起者时，删除该好友请求
  // })
  // @JoinColumn({ name: 'from_user_id', referencedColumnName: 'id' })
  // fromUser?: UserEntity;

  // @ManyToOne(() => UserEntity, (user) => user.toFriendRequests, {
  //   nullable: false, // 一条好友请求必须有一个发起者
  //   onDelete: 'CASCADE', // 删除发起者时，删除该好友请求
  // })
  // @JoinColumn({ name: 'to_user_id', referencedColumnName: 'id' })
  // toUser?: UserEntity;

  fromUser!: PublicUserInfoDto;

  toUser!: PublicUserInfoDto;
}
