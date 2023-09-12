import { CommonEntity } from 'src/common/entities/Common.entity';
import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('friends') // 好友表
export class FriendsEntity extends CommonEntity {
  @PrimaryColumn({
    comment: '用户id',
    type: 'int',
    unsigned: true,
    name: 'owner_user_id',
  })
  public ownerUserId!: number;

  @PrimaryColumn({
    comment: '好友id',
    type: 'int',
    unsigned: true,
    name: 'friend_user_id',
  })
  public friendUserId!: number;

  @Column({
    comment: 'owner对friend的分组',
    type: 'int',
    default: 0,
    name: 'owner_group',
  })
  public ownerGroup?: number;

  @Column({
    comment: 'friend对owner的分组',
    type: 'int',
    default: 0,
    name: 'friend_group',
  })
  public friendGroup?: number;

  @Column({
    comment: 'owner对friend的备注',
    type: 'varchar',
    length: 255,
    default: '',
    name: 'owner_remark',
  })
  public ownerRemark?: string;

  @Column({
    comment: 'friend对owner的备注',
    type: 'varchar',
    length: 255,
    default: '',
    name: 'friend_remark',
  })
  public friendRemark?: string;

  @Column({
    comment: '唯一标识(由owner_user_id和friend_user_id按照大小顺序拼接而成)',
    type: 'varchar',
    length: 255,
    default: '',
    name: 'unique_id',
  })
  @Index({ unique: true })
  public uniqueId!: string;
}
