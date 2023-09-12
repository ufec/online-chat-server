import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

// 分页查询参数
export class PageQueryDto {
  @ApiProperty({
    description: '分页查询的页码',
    required: false,
    example: 1,
    default: 1,
    minimum: 1,
    type: Number,
  })
  @IsNumberString({ no_symbols: true, locale: 'en-US' }, { message: '页码必须是数字' })
  @IsOptional()
  page!: number;

  @ApiProperty({
    description: '分页查询的每页数量',
    required: false,
    example: 10,
    default: 10,
    minimum: 1,
    type: Number,
  })
  @IsNumberString({ no_symbols: true, locale: 'en-US' }, { message: '每页数量必须是数字' })
  @IsOptional()
  pageSize!: number;
}
