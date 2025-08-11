import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class User extends AbstractEntity {
  @Column({
    unique: true,
    nullable: false,
  })
  username: string;

  @Column()
  password: string;
}
