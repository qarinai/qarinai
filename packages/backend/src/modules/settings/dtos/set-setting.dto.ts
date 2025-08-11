import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { SettingKey } from '../enums/setting-key.enum';

export class SetSettingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(SettingKey)
  key: SettingKey;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  value: string;
}
