import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class File extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  size: number;

  @Column()
  extension: string;

  @Column()
  mimeType: string;

  @Column({ default: 'local' })
  driver: 'local'; // Assuming 'local' is the only driver for now

  @Column()
  location: string;
}
