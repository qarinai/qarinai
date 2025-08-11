import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { SettingService } from './services/setting.service';
import { SettingsController } from './controllers/settings.controller';

@Global()
@Module({
  controllers: [SettingsController],
  imports: [TypeOrmModule.forFeature([Setting])],
  providers: [SettingService],
  exports: [SettingService],
})
export class SettingModule {}
