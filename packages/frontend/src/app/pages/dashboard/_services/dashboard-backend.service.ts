import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { buildUrl } from '../../../utils/build-url.util';
import { IDashboardChartData, IDashboardStats } from '../_interfaces/dashboard.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardBackendService {
  private http = inject(HttpClient);
  private apiEndpoint = 'dashboard';

  getStats() {
    return this.http.get<IDashboardStats>(buildUrl(this.apiEndpoint, 'stats'));
  }

  messagesChartData() {
    return this.http.get<IDashboardChartData>(buildUrl(this.apiEndpoint, 'message-chart-data'));
  }
}
