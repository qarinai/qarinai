import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { VectorStore } from './vector-store.entity';
import { VectorStoreSourceType } from '../enums/vector-store-source-type.enum';
import { VectorStoreSourceStatus } from '../enums/vector-store-source-status.enum';
import { VectorStoreSourceChunk } from './vector-store-source-chunk.entity';

@Entity()
export class VectorStoreSource extends AbstractEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({
    type: 'enum',
    enum: VectorStoreSourceType,
    default: VectorStoreSourceType.Text,
  })
  type: VectorStoreSourceType;

  @Column({
    type: 'enum',
    enum: VectorStoreSourceStatus,
    default: VectorStoreSourceStatus.Pending,
  })
  status: VectorStoreSourceStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => VectorStore)
  @JoinColumn()
  store: VectorStore;

  @OneToMany(() => VectorStoreSourceChunk, (chunk) => chunk.source)
  chunks: VectorStoreSourceChunk[];
}
