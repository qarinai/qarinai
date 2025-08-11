import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agent } from './entities/agent.entity';
import { AgentService } from './services/agent.service';
import { AgentController } from './controllers/agent.controller';
import { McpModule } from '../mcp/mcp.module';

@Module({
  controllers: [AgentController],
  imports: [TypeOrmModule.forFeature([Agent]), McpModule],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
