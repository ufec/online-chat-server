import { BaseEntity } from '@/common/entities/Base.entity';
import { MessageEntity } from '@/message/entities/Message.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('attachment')
export class AttachmentEntity extends BaseEntity {
  @PrimaryColumn({
    type: 'varchar',
    unique: true,
    nullable: false,
    comment: '附件id',
  })
  id!: string;

  @Column({ name: 'user_id', type: 'int', nullable: false, comment: '用户id' })
  userId!: number;

  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: false, comment: '文件名' })
  fileName!: string;

  @Column({ name: 'file_size', type: 'int', nullable: false, unsigned: true, comment: '文件大小' })
  fileSize!: number;

  @Column({ name: 'file_type', type: 'varchar', length: 255, nullable: false, comment: '文件类型' })
  fileType!: string;

  @Column({ name: 'file_path', type: 'varchar', length: 255, nullable: true, comment: '文件路径' })
  filePath!: string;

  @Column({ name: 'file_url', type: 'varchar', length: 255, nullable: true, comment: '文件url' })
  fileUrl!: string;

  @Column({
    name: 'message_id',
    type: 'varchar',
    nullable: true, // 附件是先上传才能拿到ID，消息是后创建的，所以这里可以为空
    comment: '消息id',
  })
  messageId!: string;

  @Column({ name: 'width', type: 'int', nullable: true, unsigned: true, comment: '图片宽度' })
  width?: number;

  @Column({ name: 'height', type: 'int', nullable: true, unsigned: true, comment: '图片高度' })
  height?: number;

  @ManyToOne(() => MessageEntity, (message) => message.attachments)
  @JoinColumn({ name: 'message_id' })
  message!: MessageEntity;
}
