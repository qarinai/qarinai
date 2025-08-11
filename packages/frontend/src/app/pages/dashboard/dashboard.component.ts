import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { StatsComponent } from './_components/stats/stats.component';
import { ChartsComponent } from './_components/charts/charts.component';

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, CardModule, StatsComponent, ChartModule, ChartsComponent],
  providers: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {}
