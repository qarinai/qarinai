export interface IEndpoint {
  id: string;
  path: string;
  method: string;
  details: any;
  description: string;
  toolData?: {
    response_type: string;
    pathParams: Record<string, any>;
    queryParams: Record<string, any>;
    bodyParams: Record<string, any>;
    headerParams: Record<string, any>;
  };
}
