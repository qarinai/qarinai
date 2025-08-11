import { Component, inject, OnInit, signal } from '@angular/core';
import { DashboardBackendService } from '../../_services/dashboard-backend.service';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-charts',
  imports: [ChartModule],
  templateUrl: './charts.component.html',
  styleUrl: './charts.component.scss'
})
export class ChartsComponent implements OnInit {
  private service = inject(DashboardBackendService);

  messagesChartData = signal<any>(null);
  messagesChartOptions = signal<any>({
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: false,
        text: 'Messages Last 7 Days'
      }
    }
  });

  conversationsChartData = signal<any>(null);
  conversationsChartOptions = signal<any>({
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: false,
        text: 'Conversations Last 7 Days'
      }
    }
  });

  tokensChartData = signal<any>(null);
  tokensChartOptions = signal<any>({
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: false,
        text: 'Tokens Last 7 Days'
      }
    }
  });

  ngOnInit(): void {
    // Initialization logic can go here
    this.loadChartData();
  }

  private loadChartData() {
    this.service.messagesChartData().subscribe({
      next: (data) => {
        this.messagesChartData.set({
          labels: data.map((item) => item.day),
          datasets: [
            {
              label: 'Messages',
              data: data.map((item) => item.messages),
              fill: true
            }
          ]
        });
        this.conversationsChartData.set({
          labels: data.map((item) => item.day),
          datasets: [
            {
              label: 'Conversations',
              data: data.map((item) => item.conversations),
              fill: true
            }
          ]
        });
        this.tokensChartData.set({
          labels: data.map((item) => item.day),
          datasets: [
            {
              label: 'Tokens',
              data: data.map((item) => item.tokens),
              fill: true
            }
          ]
        });
      },
      error: (error) => {
        console.error('Error loading chart data:', error);
      }
    });
  }
}
