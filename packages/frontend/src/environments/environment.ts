export const environment = {
  apiBaseUrl: new URL(window?.location?.href || 'http://localhost:4200').origin + '/api'
};
