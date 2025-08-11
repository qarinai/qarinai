import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Column, Entity } from 'typeorm';
import { SettingKey } from '../enums/setting-key.enum';

@Entity()
export class Setting extends AbstractEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: SettingKey,
    unique: true,
    nullable: false,
  })
  key: SettingKey;

  @Column({
    type: 'text',
    nullable: true,
  })
  value: string;
}
