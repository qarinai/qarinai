import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { LlmProviderModel } from './llm-provider-model.entity';
import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { SecureKey } from 'src/modules/secure-keys/entities/secure-key.entity';

@Entity()
export class LlmProvider extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  apiBaseUrl: string;

  @OneToOne(() => SecureKey)
  @JoinColumn()
  apiKey: SecureKey;

  @OneToMany(() => LlmProviderModel, (model) => model.provider)
  models: LlmProviderModel[];
}
