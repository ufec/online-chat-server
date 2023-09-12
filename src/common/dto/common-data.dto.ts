import { ApiProperty } from '@nestjs/swagger';

// 通用分页数据格式
export class PaginatedDto<TData> {
  @ApiProperty({ description: '数据总数', example: 1, type: Number })
  readonly total!: number;

  @ApiProperty({ description: '数据列表' })
  readonly list!: TData;

  constructor(total: number, list: TData) {
    this.total = total;
    this.list = list;
  }
}
