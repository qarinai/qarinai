import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PersonalAccessToken } from './entities/personal-access-token.entity';
import { PersonalAccessTokenService } from './services/personal-access-token.service';
import { PersonalAccessTokenController } from './controllers/personal-access-token.controller';

@Module({
  controllers: [PersonalAccessTokenController],
  imports: [TypeOrmModule.forFeature([User, PersonalAccessToken])],
  providers: [UserService, PersonalAccessTokenService],
  exports: [UserService, PersonalAccessTokenService],
})
export class UserModule {}
