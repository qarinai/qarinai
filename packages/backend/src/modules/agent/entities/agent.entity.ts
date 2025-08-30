import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { LlmProviderModel } from 'src/modules/llm-provider/entities/llm-provider-model.entity';
import { McpAdapterServer } from 'src/modules/mcp/entities/mcp-adapter-server.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Agent extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => LlmProviderModel)
  @JoinColumn()
  defaultModel: LlmProviderModel;

  @ManyToMany(() => LlmProviderModel)
  @JoinTable()
  allowedModels: LlmProviderModel[];

  @ManyToMany(() => McpAdapterServer)
  @JoinTable()
  linkedMCPServers: McpAdapterServer[];

  @Column({
    type: 'text',
    nullable: true,
  })
  identityMessage: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  systemMessage: string;

  @Column('numeric', {
    default: 0.2,
    transformer: {
      from: (value: number) => Number(value),
      to: (value: number) => Number(value),
    },
  })
  tempreture: number;

  @Column('numeric', {
    default: -1,
    transformer: {
      from: (value: number) => Number(value),
      to: (value: number) => Number(value),
    },
  })
  maxCompletionTokens: number;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('jsonb', { nullable: true })
  metadata: any;
}
