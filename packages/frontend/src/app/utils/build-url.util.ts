import { environment } from '../../environments/environment';

export const buildUrl = (...segments: string[]): string => {
  const baseUrl = environment.apiBaseUrl || 'http://localhost:3000/api';
  const url = new URL(baseUrl);

  segments.forEach((segment) => {
    if (segment) {
      url.pathname = `${url.pathname.replace(/\/$/, '')}/${segment.replace(/^\//, '')}`;
    }
  });

  return url.toString();
};
