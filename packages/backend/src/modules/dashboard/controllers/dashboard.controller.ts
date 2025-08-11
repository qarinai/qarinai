import { Controller, Get, Inject } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';

@Controller('dashboard')
export class DashboardController {
  @Inject()
  private readonly dashboardService: DashboardService;

  @Get('stats')
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('message-chart-data')
  async messageChartData() {
    return this.dashboardService.messageChartData();
  }
}
