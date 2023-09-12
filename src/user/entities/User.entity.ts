import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { CommonEntity } from 'src/common/entities/Common.entity';
import { type FriendRequestsEntity } from 'src/friend/entities/FriendRequests.entity';

@Entity('user')
export class UserEntity extends CommonEntity {
  @ApiProperty({ type: String, description: '用户名' })
  @Column({ comment: '用户名', type: 'varchar', length: 20, unique: true })
  public username!: string; // 用户名

  @Exclude({ toPlainOnly: true }) // 密码不返回给前端
  @Column({ comment: '密码', type: 'varchar', length: 32 })
  public password!: string; // 密码

  @Exclude({ toPlainOnly: true }) // 密码盐不返回给前端
  @Column({ comment: '密码盐', type: 'varchar', length: 8 })
  public salt!: string; // 密码盐

  @ApiProperty({ type: String, description: '昵称' })
  @Column({ comment: '昵称', type: 'varchar', length: 100 })
  public nickname!: string; // 昵称

  @ApiProperty({ type: String, description: '头像链接' })
  @Column({
    comment: '头像',
    type: 'varchar',
    length: 255,
    default: 'https://layui.org.cn/layim/pro/dist/layim-assets/images/default.png',
  })
  public avatar?: string; // 头像

  @ApiProperty({ type: String, description: '个性签名' })
  @Column({ comment: '个性签名', type: 'varchar', length: 255, default: '' })
  public slogan?: string; // 个性签名

  @ApiProperty({ type: Number, description: '性别, 0 男 1女 2 未知' })
  @Column({ comment: '性别', type: 'tinyint', default: 2 })
  public gender?: number; // 性别

  // 一个用户可以发起多个好友请求
  // @OneToMany(() => FriendRequestsEntity, (friendRequests) => friendRequests.fromUser, {
  //   cascade: true,
  // })
  // @JoinColumn({ name: 'id', referencedColumnName: 'from_user_id' })
  public fromFriendRequests!: FriendRequestsEntity[];

  // @OneToMany(() => FriendRequestsEntity, (friendRequests) => friendRequests.toUser, {
  //   cascade: true,
  // })
  // @JoinColumn({ name: 'id', referencedColumnName: 'to_user_id' })
  public toFriendRequests!: FriendRequestsEntity[];
}
