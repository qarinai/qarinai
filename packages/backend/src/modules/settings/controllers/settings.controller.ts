import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { SettingService } from '../services/setting.service';
import { SetSettingDto } from '../dtos/set-setting.dto';

@Controller('settings')
export class SettingsController {
  @Inject()
  private readonly settingsService: SettingService;

  @Get()
  async listSettings() {
    return this.settingsService.getAllSettings();
  }

  @Post('set')
  async updateSettings(@Body() dto: SetSettingDto) {
    return this.settingsService.setSetting(dto.key, dto.value);
  }
}
