export interface JsonApiError {
  status?: string;
  code?: string;
  code_detail?: string;
  title?: string;
  detail?: string;
  field?: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
}

export declare class ErrorResponse {
  errors?: JsonApiError[];

  constructor(errors?: JsonApiError[]);
}
