export interface CustnotesaResponse {
  CUSTNOTE: number;
  CUSTNAME: string;
  CUSTDES: string;
  SUBJECT: string | null;
  USERLOGIN: string | null;
  CURDATE: string | null;
  STIME: string | null;
  TILLDATE: string | null;
  ETIME: string | null;
  STATDES: string | null;
  GAL_PRIORITY: string | null;
  GAL_CATEGORY: string | null;
  OUDATE: string | null;
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

export interface PriorityErrorResponse {
  '?xml': {
    '@version': string;
    '@encoding': string;
    '@standalone': string;
  };
  FORM: {
    '@TYPE': string;
    InterfaceErrors: {
      '@XmlFormat': string;
      text: string;
    };
  };
}

export interface ODataCollectionResponse<T> {
  '@odata.context'?: string;
  value: T[];
}
