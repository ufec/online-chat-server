import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { FriendRequestsTypeEnum, FriendRequestsStatusEnum } from 'src/common/constants';
import { PublicUserInfoDto } from 'src/user/dto/user.dto';
import type { FriendsEntity } from '../entities/Friends.entity';

export class FriendRequestsDto {
  @ApiProperty({ description: '用户ID', type: Number })
  @IsNumber()
  readonly toUserId!: number;

  @ApiProperty({ description: '来源', type: Number })
  @IsNumber()
  readonly type!: FriendRequestsTypeEnum;

  @ApiProperty({ description: '验证信息', type: String })
  @IsOptional()
  @IsString()
  readonly extra?: string;

  @ApiProperty({ description: '备注信息', type: String })
  @IsOptional()
  @IsString()
  readonly remark?: string;
}

/**
 * 好友申请记录
 */
export class FriendRequestsRecordDto {
  @ApiProperty({ description: '记录ID', type: Number })
  readonly id!: number;

  @ApiProperty({ description: '申请用户ID', type: Number })
  readonly fromUserId!: number;

  @ApiProperty({ description: '来源', type: Number })
  readonly type!: FriendRequestsTypeEnum;

  @ApiProperty({ description: '验证信息', type: String })
  @IsOptional()
  readonly extra?: string;

  @ApiProperty({ description: '备注信息', type: String })
  @IsOptional()
  readonly remark?: string;

  @ApiProperty({ description: '申请时间', type: String })
  readonly createdAt!: string;

  @ApiProperty({ description: '申请状态', type: Number })
  readonly status!: FriendRequestsStatusEnum;

  @ApiProperty({ description: '申请用户信息', type: PublicUserInfoDto })
  fromUser!: PublicUserInfoDto;
}

/**
 * 接受好友申请请求体
 */
export class AcceptFriendRequestsBodyDto {
  @ApiProperty({ description: '记录ID', type: Number })
  @IsNumber({}, { message: '记录ID必须为数字' })
  readonly id!: number;

  @ApiProperty({ description: '备注信息', type: String })
  @IsOptional()
  readonly remark?: string;
}

export type CreateFriendDto = Omit<
  FriendsEntity,
  'version' | 'isDelete' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'id' | 'uniqueId'
> & {
  uniqueId?: string;
};

export class FriendDto {
  @ApiProperty({ description: '好友信息', type: PublicUserInfoDto })
  readonly friendInfo!: PublicUserInfoDto;

  @ApiProperty({ description: '好友备注', example: '小明', type: String })
  readonly remark!: string;

  @ApiProperty({ description: '好友分组id', example: 1, type: Number })
  readonly groupId!: number;

  @ApiProperty({ description: '成为好友的时间', example: '2021-01-01 00:00:00', type: String })
  readonly createdAt!: string;

  @ApiProperty({ description: '频道id', example: 1, type: Number })
  readonly channelId!: string;
}

export class DeleteFriendDto {
  @ApiProperty({ description: '好友id', example: 1, type: Number })
  @IsNumber({}, { message: '好友id必须为数字' })
  readonly friendId!: number;
}
