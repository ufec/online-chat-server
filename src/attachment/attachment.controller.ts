import { Controller } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('attachment')
@ApiTags('附件模块')
export class AttachmentController {
  private readonly svaeAttachmentWheres = {
    local: 'local',
    oss: 'oss',
  };

  private readonly defaultSaveAttachmentWhere = this.svaeAttachmentWheres.local;

  constructor(private readonly attachmentService: AttachmentService) {}
}
