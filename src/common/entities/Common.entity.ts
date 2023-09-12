import { PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './Base.entity';

export abstract class CommonEntity extends BaseEntity {
  // 主键id
  @PrimaryGeneratedColumn({ comment: '主键id', type: 'int', unsigned: true })
  id!: number;
}
