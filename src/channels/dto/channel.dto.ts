import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';
import { ChannelRole, ChannelType } from '../interface/channel.interface';
import { BaseEntityDto } from '@/common/dto/common-result.dto';

export class QueryChannelMemberInfoDto {
  @ApiProperty({ description: '频道id', required: true, example: '123456', type: String })
  @IsNumberString(
    {
      no_symbols: true, // 不允许包含符号
      locale: 'en-US', // 语言环境
    },
    { message: '频道id必须是数字' }
  )
  @IsNotEmpty({ message: '频道id不能为空' })
  channelId!: string;
}

export class ChannelDto extends BaseEntityDto {
  @ApiProperty({ description: '频道id', example: '123456', type: String })
  id!: string;

  @ApiProperty({ description: '频道默认名称', example: '频道名称', type: String })
  channelName!: string;

  @ApiProperty({ description: '频道默认头像', example: '频道头像', type: String })
  avatar!: string;

  @ApiProperty({
    description: '频道类型 0:好友 1:群组',
    example: 0,
    enum: ChannelType,
    type: Number,
  })
  channelType!: number;
}

export class ChannelMemberDto extends BaseEntityDto {
  @ApiProperty({ description: '频道id', example: '123456', type: String })
  channelId!: string;

  @ApiProperty({ description: '成员id', example: 2, type: Number })
  memberId!: number;

  @ApiProperty({
    description: '频道成员角色名称, 0:普通成员 1:管理员 2:群主',
    required: true,
    example: 0,
    enum: ChannelRole,
    type: Number,
  })
  role!: number;

  @ApiProperty({ description: '成员对频道起的别名', example: '别名', type: String })
  aliasChannelName!: string;

  @ApiProperty({ description: '成员在频道中的别名', example: '别名', type: String })
  aliasMemberName!: string;

  @ApiProperty({ description: '频道基础信息', type: ChannelDto, nullable: true, required: false })
  channel!: ChannelDto | null;
}
