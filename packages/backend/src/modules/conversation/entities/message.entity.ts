import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Conversation } from './conversation.entity';
import { LlmProviderModel } from 'src/modules/llm-provider/entities/llm-provider-model.entity';
import { AbstractEntity } from 'src/common/entities/abstract.entity';

@Entity()
export class Message extends AbstractEntity {
  @ManyToOne(() => Conversation)
  @JoinColumn()
  conversation: Conversation;

  @Column({
    type: 'enum',
    enum: ['pending', 'generating', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  })
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'cancelled';

  @Column({ type: 'varchar', nullable: true })
  originalMsgId: string | null;

  @ManyToOne(() => LlmProviderModel)
  @JoinColumn()
  model: LlmProviderModel;

  @Column({
    type: 'enum',
    enum: ['user', 'assistant', 'tool'],
  })
  role: 'user' | 'assistant' | 'tool';

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  additionalData: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  numTokens: number;
}
