import { SnowflakeService } from '@/common/services/snowflake.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as fs from 'node:fs';
import { type MultipartFile } from '@fastify/multipart';
import { AttachmentEntity } from './entities/Attachment.entity';
import { type CreateAttachmentDto } from './dto/create-attachment.dto';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(AttachmentEntity)
    private readonly attachmentRepository: Repository<AttachmentEntity>,
    private readonly snowflakeService: SnowflakeService
  ) {}

  async createAttachment(attachments: CreateAttachmentDto[]) {
    const entitys = attachments.map((attachment) => {
      return this.attachmentRepository.create({
        ...attachment,
        id: this.snowflakeService.nextId(),
      });
    });
    try {
      return await this.attachmentRepository.save(entitys);
    } catch (e: any) {
      throw new Error('failed to create attachment');
    }
  }

  async updateAttachment(attachmentIds: string[], messageId: string) {
    // 新增消息与附件的关联
    const updateAttachment = attachmentIds.map((id) => {
      return {
        id,
        messageId,
      };
    });
    try {
      await this.attachmentRepository.save(updateAttachment);
    } catch (e: any) {
      console.log(e);
      throw new Error('failed to update attachment');
    }
  }

  /**
   * 保存附件到本地
   * @param file 文件
   * @param userPath 用户路径
   * @returns 附件路径
   */
  saveAttachmentToLocalStorage(file: MultipartFile, userPath: string) {
    // 将文件保存到根目录的 uploads 文件夹下，并根据年月日生成文件夹
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const path = `uploads/attachment/${userPath}/${year}/${month}/${day}`;
    // 如果文件夹不存在则创建
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    // 生成随机文件名
    const filename = `${Date.now()}-${Math.floor(Math.random() * 10000)}.${file.filename}`;
    // 保存文件
    file.file.pipe(fs.createWriteStream(`${path}/${filename}`));
    return `/${path}/${filename}`;
  }

  /**
   * 根据附件id列表批量查询附件
   * @param attachmentIds 附件id列表
   * @returns 附件列表
   */
  async queryAttachmentByIds(attachmentIds: string[]) {
    return await this.attachmentRepository.find({
      where: {
        id: In(attachmentIds),
      },
    });
  }
}
