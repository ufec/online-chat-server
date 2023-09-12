import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class QueryMessagesByChannelIdsPayload {
  @ApiProperty({ description: '频道id列表', example: [1, 2, 3], type: [String] })
  @IsNotEmpty({ message: '频道id列表不能为空' })
  @IsArray({ message: '频道id列表必须为数组' })
  channelIds!: string[];
}
