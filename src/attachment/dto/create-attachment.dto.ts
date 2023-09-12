import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateAttachmentDto {
  @ApiProperty({ description: '用户id' })
  @IsNumber(
    {
      allowNaN: false,
      allowInfinity: false,
    },
    { message: '用户id必须为数字' }
  )
  userId!: number;

  @ApiProperty({ description: '文件名' })
  @IsString({ message: '文件名必须为字符串' })
  fileName!: string;

  @ApiProperty({ description: '文件大小' })
  @IsNumber(
    {
      allowNaN: false,
      allowInfinity: false,
    },
    { message: '文件大小必须为数字' }
  )
  fileSize!: number;

  @ApiProperty({ description: '文件类型' })
  @IsString({ message: '文件类型必须为字符串' })
  fileType!: string;

  @ApiProperty({ description: '文件路径' })
  @IsString({ message: '文件路径必须为字符串' })
  @IsOptional()
  filePath?: string;

  @ApiProperty({ description: '文件url' })
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
      require_host: true,
      require_tld: true,
    },
    { message: '文件url必须为url' }
  )
  @IsOptional()
  fileUrl?: string;

  @ApiProperty({ description: '图片宽，只有在文件类型为图片时才需要' })
  @IsOptional()
  width?: number;

  @ApiProperty({ description: '图片高，只有在文件类型为图片时才需要' })
  @IsOptional()
  height?: number;
}
