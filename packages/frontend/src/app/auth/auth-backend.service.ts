import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { buildUrl } from '../utils/build-url.util';
import { ILoginCredentials, ILoginResponse } from './_interfaces/login.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthBackendService {
  private http = inject(HttpClient);
  private apiEndpoint = 'auth';

  login(credentials: ILoginCredentials) {
    return this.http.post<ILoginResponse>(buildUrl(this.apiEndpoint, 'login'), credentials);
  }

  refresh(refreshToken: string) {
    return this.http.post<ILoginResponse>(buildUrl(this.apiEndpoint, 'refresh'), { refreshToken: refreshToken });
  }
}
