import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { PersonalAccessTokenService } from '../services/personal-access-token.service';
import { Request } from 'express';
import { CreatePatDto } from '../dtos/create-pat.dto';

@Controller('personal-access-tokens')
export class PersonalAccessTokenController {
  @Inject()
  private readonly patService: PersonalAccessTokenService;

  @Get()
  listAllPatTokens(@Req() request: Request) {
    const tokenPayload = (request as any).user;
    return this.patService.listUserTokens(tokenPayload);
  }

  @Post()
  createPatToken(@Req() request: Request, @Body() dto: CreatePatDto) {
    const tokenPayload = (request as any).user;
    return this.patService.createToken(tokenPayload, dto);
  }

  @Delete(':id')
  deletePatToken(@Req() request: Request, @Param('id') tokenId: string) {
    const tokenPayload = (request as any).user;
    return this.patService.deleteToken(tokenPayload, tokenId);
  }
}
