import { ApiProperty } from '@nestjs/swagger';
import { ChannelRole, ChannelType } from '../interface/channel.interface';
import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateChannelDto {
  @ApiProperty({ example: 'channelName', description: 'Channel name' })
  channelName!: string;

  @ApiProperty({ example: 'avatar', description: 'Channel avatar', nullable: true })
  avatar?: string;

  @ApiProperty({
    example: 0,
    description: 'Channel type',
    enum: ChannelType,
    type: Number,
    required: true,
  })
  channelType!: ChannelType;

  @ApiProperty({ example: 'friendUniqueId', description: 'Friend unique id', nullable: true })
  friendUniqueId!: string;
}

export class CreateChannelMemberDto {
  @ApiProperty({ example: 1, description: 'Channel id', type: String, required: true })
  channelId!: string;

  @ApiProperty({ example: 1, description: 'Member id', type: Number, required: true })
  memberId!: number;

  @ApiProperty({
    example: 0,
    description: 'Channel member role',
    enum: ChannelRole,
    type: Number,
    required: true,
  })
  role!: ChannelRole;

  @ApiProperty({ example: 'aliasChannelName', description: 'Alias channel name', nullable: true })
  aliasChannelName!: string;

  @ApiProperty({ example: 'aliasMemberName', description: 'Alias member name', nullable: true })
  aliasMemberName!: string;

  @ApiProperty({
    example: 0,
    description: 'Channel type',
    enum: ChannelType,
    type: Number,
    required: true,
  })
  channelType!: ChannelType;
}

export class CreateGroupDto {
  @ApiProperty({ example: 'groupName', description: 'Group name' })
  @IsOptional()
  @IsString({ message: 'Group name must be a string' })
  groupName?: string;

  @ApiProperty({ example: 'avatar', description: 'Group avatar', nullable: true })
  @IsOptional()
  @IsUrl(
    {
      require_protocol: true,
      require_valid_protocol: true,
      protocols: ['http', 'https'],
    },
    { message: 'Group avatar must be a url' }
  )
  avatar?: string;

  @ApiProperty({
    example: 'description',
    description: 'Group member id',
    nullable: true,
    type: [Number],
  })
  @IsArray({ message: 'Group member id must be an array' })
  memberIds!: number[];
}
