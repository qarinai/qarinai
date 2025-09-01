interface IMcpServerSecurityBase {
  isSecure: boolean;
  securityType: 'none' | 'basic' | 'bearer' | 'apiKey';
}

export interface IMcpServerSecurityNone extends IMcpServerSecurityBase {
  isSecure: false;
  securityType: 'none';
}

export interface IMcpServerSecurityBasic extends IMcpServerSecurityBase {
  isSecure: true;
  securityType: 'basic';
  value:
    | {
        type: 'static';
        credentials: {
          username: string;
          password: string;
        };
      }
    | {
        type: 'dynamic';
        fromToolParameters: {
          username: {
            name: '__auth_username';
            schema: {
              type: 'string';
            };
          };
          password: {
            name: '__auth_password';
            schema: {
              type: 'string';
            };
          };
        };
      };
}

export interface IMcpServerSecurityBearer extends IMcpServerSecurityBase {
  isSecure: true;
  securityType: 'bearer';
  value:
    | {
        type: 'static';
        token: string;
      }
    | {
        type: 'dynamic';
        fromToolParameters: {
          token: {
            name: '__auth_token';
            schema: {
              type: 'string';
            };
          };
        };
      };
}

export interface IMcpServerSecurityApiKey extends IMcpServerSecurityBase {
  isSecure: true;
  securityType: 'apiKey';
  value:
    | {
        type: 'static';
        apiKey: string;
      }
    | {
        type: 'dynamic';
        fromToolParameters: {
          apiKey: {
            name: '__api_key';
            schema: {
              type: 'string';
            };
          };
        };
      };
  authParamName: string;
  authParamIn: 'header' | 'query' | 'cookie';
}

export type IMcpServerSecurity =
  | IMcpServerSecurityNone
  | IMcpServerSecurityBasic
  | IMcpServerSecurityBearer
  | IMcpServerSecurityApiKey;
