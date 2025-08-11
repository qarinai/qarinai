import { Agent } from 'src/modules/agent/entities/agent.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Message } from './message.entity';
import { AbstractEntity } from 'src/common/entities/abstract.entity';

@Entity()
export class Conversation extends AbstractEntity {
  @ManyToOne(() => Agent)
  @JoinColumn()
  agent: Agent;

  @Column({ type: 'text' })
  systemMessage: string;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @Column({ type: 'int', default: 0 })
  totalTokens: number;
}
