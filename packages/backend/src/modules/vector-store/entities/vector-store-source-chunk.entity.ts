import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { VectorStoreSource } from './vector-store-source.entity';

@Entity()
export class VectorStoreSourceChunk extends AbstractEntity {
  @Column()
  content: string;

  @Column()
  embeddings: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => VectorStoreSource)
  @JoinColumn()
  source: VectorStoreSource;
}
