import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SecureKey } from '../entities/secure-key.entity';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  Repository,
} from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@EventSubscriber()
@Injectable()
export class SecureKeyService implements EntitySubscriberInterface<SecureKey> {
  listenTo() {
    return SecureKey;
  }

  constructor(
    @InjectRepository(SecureKey)
    private readonly secureKeyRepository: Repository<SecureKey>,
    @Inject()
    private readonly configService: ConfigService,
  ) {
    this.secureKeyRepository.manager.connection.subscribers.push(this);
  }

  async createAndSaveSecureKey(valueText: string) {
    return this.secureKeyRepository.save({
      value: valueText,
    });
  }

  encrypt(valueText: string) {
    const algorithm = 'aes-256-cbc';
    const passPhrase =
      this.configService.get<string>('SECURE_KEY_PASSPHRASE') ?? '';
    const hmac = crypto.createHmac('sha256', passPhrase);
    const key = hmac.digest();

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(valueText, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const ivBase64 = iv.toString('base64');

    return `${encrypted}:${ivBase64}`;
  }

  createMask(valueText: string) {
    return (
      valueText.substring(valueText.length - 3) +
      '*'.repeat(20) +
      valueText.substring(0, 3)
    );
  }

  decrypt(value: string) {
    const [encryptedValue, ivBase64] = value.split(':');
    const iv = Buffer.from(ivBase64, 'base64');

    const algorithm = 'aes-256-cbc';
    const passPhrase =
      this.configService.get<string>('SECURE_KEY_PASSPHRASE') ?? '';
    const hmac = crypto.createHmac('sha256', passPhrase);
    const key = hmac.digest();

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedValue, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  getKeyById(id: string) {
    return this.secureKeyRepository.findOne({
      where: { id },
    });
  }

  async getDecryptedKeyById(id: string) {
    const secureKey = await this.secureKeyRepository.findOne({
      where: { id },
    });
    if (!secureKey) {
      throw new Error('Secure key not found');
    }
    return this.decrypt(secureKey.value);
  }

  beforeInsert(event: InsertEvent<SecureKey>): Promise<any> | void {
    const secureKey = event.entity;
    if (secureKey && secureKey.value) {
      secureKey.value = this.encrypt(secureKey.value);
      secureKey.mask = this.createMask(secureKey.value);
    }
  }
}
