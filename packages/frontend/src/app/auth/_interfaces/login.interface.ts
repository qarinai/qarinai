export interface ILoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    username: string;
  };
}

export interface ILoginCredentials {
  username: string;
  password: string;
}
