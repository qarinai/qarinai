import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { ChatProviderModel } from './chat-provider-model.entity';
import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { SecureKey } from 'src/modules/secure-keys/entities/secure-key.entity';

@Entity()
export class ChatProvider extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  apiBaseUrl: string;

  @OneToOne(() => SecureKey)
  @JoinColumn()
  apiKey: SecureKey;

  @OneToMany(() => ChatProviderModel, (model) => model.provider)
  models: ChatProviderModel[];
}
