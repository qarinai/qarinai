import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/modules/user/services/user.service';
import { PersonalAccessTokenService } from 'src/modules/user/services/personal-access-token.service';

@Injectable()
export class AuthService {
  @Inject()
  private readonly userService: UserService;

  @Inject()
  private readonly patService: PersonalAccessTokenService;

  @Inject()
  private readonly jwtService: JwtService;

  @Inject()
  private readonly config: ConfigService;

  async login(username: string, password: string) {
    const user = await this.userService.getUserbyUsername(username);
    if (!user) {
      throw new BadRequestException('username or password is incorrect');
    }

    const passwordMatch = await argon.verify(user.password, password);
    if (!passwordMatch) {
      throw new BadRequestException('username or password is incorrect');
    }

    const payload = { username: user.username, sub: user.id };
    const access_token = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_TOKEN_EXPIRATION'),
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_TOKEN_EXPIRATION'),
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<{ username: string; sub: string }>(
        refreshToken,
        {
          secret: this.config.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        },
      );

      const user = await this.userService.getUserbyUsername(payload.username);
      if (!user) {
        throw new Error();
      }

      const newAccessToken = this.jwtService.sign(
        { username: user.username, sub: user.id },
        {
          secret: this.config.get<string>('JWT_ACCESS_TOKEN_SECRET'),
          expiresIn: this.config.get<string>('JWT_ACCESS_TOKEN_EXPIRATION'),
        },
      );

      const newRefreshToken = this.jwtService.sign(
        { username: user.username, sub: user.id },
        {
          secret: this.config.get<string>('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: this.config.get<string>('JWT_REFRESH_TOKEN_EXPIRATION'),
        },
      );

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        user: { id: user.id, username: user.username },
      };
    } catch {
      throw new BadRequestException('Invalid refresh token');
    }
  }

  verifyToken(token: string) {
    return this.jwtService.verifyAsync<{ username: string; sub: string }>(
      token,
      {
        secret: this.config.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      },
    );
  }

  async verfiyPersonalAccessToken(id: string, rawToken: string) {
    return this.patService.vertifyToken(id, rawToken);
  }
}
