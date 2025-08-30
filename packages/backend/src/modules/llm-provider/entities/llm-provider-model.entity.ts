import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { LlmProvider } from './llm-provider.entity';
import { AbstractEntity } from 'src/common/entities/abstract.entity';

@Entity()
export class LlmProviderModel extends AbstractEntity {
  @ManyToOne(() => LlmProvider)
  @JoinColumn()
  provider: LlmProvider;

  @Column()
  name: string;
}
