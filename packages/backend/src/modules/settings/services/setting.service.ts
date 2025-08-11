import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from '../entities/setting.entity';
import { Repository } from 'typeorm';
import { SettingKey } from '../enums/setting-key.enum';
import * as _ from 'lodash';

@Injectable()
export class SettingService {
  @InjectRepository(Setting)
  private readonly settingRepository: Repository<Setting>;

  async getAllSettings(): Promise<Setting[]> {
    return this.settingRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getSetting(key: SettingKey): Promise<Setting | null> {
    return this.settingRepository.findOne({
      where: { key },
    });
  }

  async setSetting(key: SettingKey, value: string): Promise<Setting> {
    let setting = await this.getSetting(key);
    if (!setting) {
      setting = this.settingRepository.create({
        key,
        value,
        name: _.startCase(key),
      });
    } else {
      setting.value = value;
    }
    return this.settingRepository.save(setting);
  }
}
