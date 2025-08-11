import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IPersonalAccessToken } from '../_interfaces/personal-access-token.interface';
import { buildUrl } from '../../../utils/build-url.util';
import { ICreatedPersonalAccessToken } from '../_interfaces/created-pat.interface';

@Injectable({
  providedIn: 'root'
})
export class PersonalAccessTokenBackendService {
  private http = inject(HttpClient);
  private apiEndpoint = 'personal-access-tokens';

  listTokens() {
    return this.http.get<IPersonalAccessToken[]>(buildUrl(this.apiEndpoint));
  }

  createToken(body: Pick<IPersonalAccessToken, 'name' | 'expirationDate'>) {
    return this.http.post<ICreatedPersonalAccessToken>(buildUrl(this.apiEndpoint), body);
  }

  deleteToken(id: string) {
    return this.http.delete<void>(buildUrl(this.apiEndpoint, id));
  }
}
