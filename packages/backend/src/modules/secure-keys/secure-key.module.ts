import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecureKey } from './entities/secure-key.entity';
import { SecureKeyService } from './services/secure-key.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SecureKey])],
  controllers: [],
  providers: [SecureKeyService],
  exports: [SecureKeyService],
})
export class SecureKeyModule {}
