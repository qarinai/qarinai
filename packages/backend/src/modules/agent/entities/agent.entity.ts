import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { ChatProviderModel } from 'src/modules/chat-provider/entities/chat-provider-model.entity';
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

  @ManyToOne(() => ChatProviderModel)
  @JoinColumn()
  defaultModel: ChatProviderModel;

  @ManyToMany(() => ChatProviderModel)
  @JoinTable()
  allowedModels: ChatProviderModel[];

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
