import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class PersonalAccessToken extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  hashedToken: string;

  @Column()
  expirationDate: Date;

  // TODO: add scopes

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;
}
