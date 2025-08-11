import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { VectorStoreSource } from './vector-store-source.entity';
import { VectorStoreStatus } from '../enums/vector-store-status.enum';
import { McpAdapterServer } from 'src/modules/mcp/entities/mcp-adapter-server.entity';

@Entity()
export class VectorStore extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  summary: string;

  @Column({
    type: 'enum',
    enum: VectorStoreStatus,
    default: VectorStoreStatus.Pending,
  })
  status: VectorStoreStatus;

  @Column({ nullable: true })
  generatedDescription: string;

  @OneToMany(() => VectorStoreSource, (source) => source.store)
  sources: VectorStoreSource[];

  @OneToOne(() => McpAdapterServer)
  @JoinColumn()
  mcpServer: McpAdapterServer;
}
