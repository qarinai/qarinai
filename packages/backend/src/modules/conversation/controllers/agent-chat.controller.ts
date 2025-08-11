import { Body, Controller, Inject, Param, Post, Res } from '@nestjs/common';
import { MessageService } from '../services/message.service';
import {
  SendMessageBodyDto,
  SendMessageParamsDto,
} from '../dtos/send-message.dto';
import { Response } from 'express';
import { IsPublic } from 'src/modules/auth/decorators/is-public.decorator';

@Controller('agents/:agentId/chat')
export class AgentChatController {
  @Inject()
  private readonly messageService: MessageService;

  @IsPublic()
  @Post('messages')
  async sendMessages(
    @Param() params: SendMessageParamsDto,
    @Body() body: SendMessageBodyDto,
    @Res() res: Response,
  ) {
    await this.messageService.assistantMessageResponse(body, params, res);
  }
}
