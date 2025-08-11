import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { buildUrl } from '../../../utils/build-url.util';

@Injectable({
  providedIn: 'root'
})
export class VectorStoreSourceBackendService {
  private readonly apiEndpoint = 'vector-store-sources';

  constructor(private readonly http: HttpClient) {}

  createSource(source: { fileId: string; storeId: string; name: string }) {
    return this.http.post(buildUrl(this.apiEndpoint), source);
  }
}
