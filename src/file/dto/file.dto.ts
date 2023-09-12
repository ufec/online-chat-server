import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDTO {
  @ApiProperty({
    description: '文件地址',
    example: 'uploads/2021/8/1/1627880000000-1234.png',
    type: String,
  })
  url!: string;

  @ApiProperty({
    description: '文件名',
    example: '1627880000000-1234.png',
    type: String,
  })
  filename!: string;

  @ApiProperty({
    description: '文件类型',
    example: 'image/png',
    type: String,
  })
  mimetype!: string;

  @ApiProperty({
    description: '文件编码',
    example: '7bit',
    type: String,
  })
  encoding!: string;

  @ApiProperty({
    description: '文件大小',
    example: 1234,
    type: Number,
  })
  size!: number;
}
