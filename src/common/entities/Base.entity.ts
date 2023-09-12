import { Exclude } from 'class-transformer';
import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn, VersionColumn } from 'typeorm';

export abstract class BaseEntity {
  // 创建时间 repository.save() 时会自动填充
  @CreateDateColumn({
    type: 'datetime',
    name: 'created_at',
    comment: '创建时间',
  })
  createdAt!: string;

  // 更新时间 repository.save() 时会自动填充
  @UpdateDateColumn({
    type: 'datetime',
    name: 'updated_at',
    comment: '更新时间',
    default: null,
  })
  updatedAt!: string | null;

  // 软删除 repository.softDelete() 时会自动填充
  @DeleteDateColumn({
    type: 'datetime',
    name: 'deleted_at',
    comment: '删除时间',
    default: null,
  })
  @Exclude()
  deletedAt!: string | null;

  // 乐观锁 repository.save() 时会自动填充
  @VersionColumn({ comment: 'version', type: 'int', default: 0, select: false })
  version!: number;
}
