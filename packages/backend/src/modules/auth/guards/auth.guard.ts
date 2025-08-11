/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject()
  private readonly authService: AuthService;

  @Inject()
  private readonly reflector: Reflector;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const isPublic = this.reflector.getAllAndOverride<boolean>('IS_PUBLIC', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Skip authentication for public routes
    }

    const token = request.headers?.authorization?.split(' ')[1] as string;

    if (!token) {
      return false; // No token provided
    }

    if (token.includes('.')) {
      return this.verifyJWT(token, request); // JWT token
    } else {
      return this.verifyPAT(token, request); // Personal Access Token
    }
  }

  private async verifyJWT(token: string, request: Request) {
    try {
      const payload = await this.authService.verifyToken(token);
      if (!payload) {
        throw new Error();
      }
      (request as any).user = payload; // Attach user info to request
      return true; // Token is valid
    } catch {
      return false;
    }
  }

  private async verifyPAT(token: string, request: Request) {
    try {
      const [id, rawToken] = Buffer.from(token, 'base64')
        .toString('utf-8')
        .split(':');
      const pat = await this.authService.verfiyPersonalAccessToken(
        id,
        rawToken,
      );
      if (!pat) {
        throw new Error();
      }
      (request as any).user = { sub: pat.user.id, username: pat.user.username }; // Attach user info to request
      return true; // PAT is valid
    } catch {
      return false;
    }
  }
}
