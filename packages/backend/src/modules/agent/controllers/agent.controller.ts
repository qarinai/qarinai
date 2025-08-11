import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AgentService } from '../services/agent.service';
import { CreateAgentDto } from '../dtos/create-agent.dto';
import { IsPublic } from 'src/modules/auth/decorators/is-public.decorator';

@Controller('agents')
export class AgentController {
  @Inject()
  private readonly agentService: AgentService;

  @IsPublic()
  @Get(':id')
  getAgentById(@Param('id') id: string) {
    return this.agentService.getAgentById(id);
  }

  @Get()
  listAgents() {
    return this.agentService.listAgents();
  }

  @Post()
  createAgent(@Body() dto: CreateAgentDto) {
    return this.agentService.createAgent(dto);
  }

  @Put(':id')
  updateAgent(@Param('id') id: string, @Body() dto: CreateAgentDto) {
    return this.agentService.updateAgent(id, dto);
  }
}
