import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class SecureKey extends AbstractEntity {
  @Column()
  value: string;

  @Column()
  mask: string;
}
