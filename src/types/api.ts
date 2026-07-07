export interface CustnotesaResponse {
  CUSTNOTE: number;
  CUSTNAME: string;
  CUSTDES: string;
  SUBJECT: string;
  USERLOGIN: string;
  CURDATE: string;
  STIME: string;
  TILLDATE: string;
  ETIME: string;
  STATDES: string;
  GAL_PRIORITY: string;
  GAL_CATEGORY: string;
}

export interface CreateTaskPayload {
  CUSTNAME: string;
  SUBJECT: string;
  USERLOGIN: string;
  TILLDATE: string;
  GAL_PRIORITY: string;
  GAL_CATEGORY: string;
  STATDES: string;
}

export interface UpdateTaskPayload {
  SUBJECT?: string;
  USERLOGIN?: string;
  TILLDATE?: string;
  ETIME?: string;
  STATDES?: string;
  GAL_PRIORITY?: string;
  GAL_CATEGORY?: string;
}

export interface ODataErrorResponse {
  error: {
    code: string;
    message: string;
    target: string;
    details: Record<string, unknown>;
    innererror: Record<string, unknown>;
  };
}

export interface ODataCollectionResponse<T> {
  '@odata.context'?: string;
  value: T[];
}
