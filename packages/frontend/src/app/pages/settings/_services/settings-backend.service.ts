import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { buildUrl } from '../../../utils/build-url.util';
import { ISetting } from '../_interfaces/settings.interface';

@Injectable({
  providedIn: 'root'
})
export class SettingsBackendService {
  private readonly apiEndpoint = 'settings';

  constructor(private readonly http: HttpClient) {}

  listAllSettings() {
    return this.http.get<ISetting[]>(buildUrl(this.apiEndpoint));
  }

  setSetting(body: Pick<ISetting, 'key' | 'value'>) {
    return this.http.post<ISetting>(buildUrl(this.apiEndpoint, 'set'), body);
  }
}
