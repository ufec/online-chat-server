import { BaseEntityDto } from '@/common/dto/common-result.dto';
import { type AttachmentEntity } from '../entities/Attachment.entity';
import { type MessageResultDto } from '@/message/dto/result.message.dto';

export type AttachmentResultType = Omit<
  AttachmentEntity,
  'createdAt' | 'updatedAt' | 'deletedAt' | 'version' | 'message'
>;
export class AttachmentResultDto extends BaseEntityDto {
  id!: string;
  userId!: number;
  fileName!: string;
  fileUrl!: string;
  fileSize!: number;
  fileType!: string;
  filePath!: string;
  messageId!: string;
  width?: number;
  height?: number;
  message?: MessageResultDto;
}
