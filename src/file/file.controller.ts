import { Controller, Post, Req } from '@nestjs/common';
import { FileService } from './file.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAnon } from 'src/common/decorators/AllowAnon.decorator';
import { FastifyRequest } from 'fastify';
import { ResultDto } from 'src/common/dto/common-result.dto';
import ApiCode from 'src/common/enums/ApiCode.enum';
import { type UploadFileDTO } from './dto/file.dto';

@Controller('file')
@ApiTags('文件')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('/uploadAvatar')
  @ApiOperation({ summary: '上传头像' })
  @AllowAnon()
  async uploadAvatar(@Req() req: FastifyRequest) {
    const file = await req.file();
    if (file === undefined) {
      return ResultDto.fail(ApiCode.UPLOAD_FILE_FAIL_CODE, ApiCode.UPLOAD_FILE_FAIL_MSG);
    }
    const url = this.fileService.uploadAvatar(file);
    return ResultDto.ok<UploadFileDTO>({
      url,
      filename: file.filename,
      mimetype: file.mimetype,
      encoding: file.encoding,
      size: file.file.bytesRead,
    });
  }
}
