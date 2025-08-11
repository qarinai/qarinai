import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ChatProvider } from './chat-provider.entity';
import { AbstractEntity } from 'src/common/entities/abstract.entity';

@Entity()
export class ChatProviderModel extends AbstractEntity {
  @ManyToOne(() => ChatProvider)
  @JoinColumn()
  provider: ChatProvider;

  @Column()
  name: string;
}
