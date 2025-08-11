import { IPersonalAccessToken } from './personal-access-token.interface';

export interface ICreatedPersonalAccessToken extends IPersonalAccessToken {
  token: string;
}
