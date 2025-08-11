import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PersonalAccessToken } from '../entities/personal-access-token.entity';
import { Repository } from 'typeorm';
import { CreatePatDto } from '../dtos/create-pat.dto';
import { UserService } from './user.service';
import * as crypto from 'crypto';
import * as argon from 'argon2';

@Injectable()
export class PersonalAccessTokenService {
  @InjectRepository(PersonalAccessToken)
  private readonly personalAccessTokenRepository: Repository<PersonalAccessToken>;

  @Inject()
  private readonly userService: UserService;

  async listUserTokens(tokenPayload: { sub: string; username: string }) {
    return this.personalAccessTokenRepository.find({
      where: { user: { id: tokenPayload.sub } },
      select: {
        id: true,
        name: true,
        expirationDate: true,
        createdAt: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async createToken(
    tokenPayload: { sub: string; username: string },
    dto: CreatePatDto,
  ) {
    const user = await this.userService.getUserbyUsername(
      tokenPayload.username,
    );
    if (!user) {
      throw new ForbiddenException();
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await argon.hash(rawToken);

    const tokenObj = await this.personalAccessTokenRepository.save(
      this.personalAccessTokenRepository.create({
        name: dto.name,
        user: user,
        expirationDate: dto.expirationDate,
        hashedToken: hashedToken,
      }),
    );

    const patRaw = `${tokenObj.id}:${rawToken}`;
    const pat = Buffer.from(patRaw).toString('base64');

    return {
      id: tokenObj.id,
      name: tokenObj.name,
      expirationDate: tokenObj.expirationDate,
      token: pat,
    };
  }

  async deleteToken(
    tokenPayload: { sub: string; username: string },
    tokenId: string,
  ) {
    const token = await this.personalAccessTokenRepository.findOne({
      where: { id: tokenId, user: { id: tokenPayload.sub } },
    });

    if (!token) {
      throw new NotFoundException('Token not found');
    }

    await this.personalAccessTokenRepository.softDelete(tokenId);
  }

  async vertifyToken(id: string, rawToken: string) {
    const token = await this.personalAccessTokenRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!token) {
      throw new NotFoundException('Token not found');
    }

    if (token.expirationDate < new Date()) {
      throw new ForbiddenException('Token has expired');
    }

    const isValid = await argon.verify(token.hashedToken, rawToken);
    if (!isValid) {
      throw new ForbiddenException('Invalid token');
    }

    return token;
  }
}
