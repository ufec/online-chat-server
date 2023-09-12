import { Module } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { SnowflakeService } from '@/common/services/snowflake.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentEntity } from './entities/Attachment.entity';
import { AttachmentController } from './attachment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AttachmentEntity])],
  providers: [
    AttachmentService,
    { provide: SnowflakeService, useValue: new SnowflakeService(1, 3) },
  ],
  controllers: [AttachmentController],
  exports: [AttachmentService, TypeOrmModule],
})
export class AttachmentModule {}
