import { getApiBaseUrl, getCredentials } from '../config';
import type {
  CustnotesaResponse,
  CreateTaskPayload,
  UpdateTaskPayload,
  ODataErrorResponse,
  ODataCollectionResponse,
  PriorityErrorResponse,
} from '../types/api';

function buildAuthHeader(): string {
  const { user, password } = getCredentials();
  return 'Basic ' + btoa(`${user}:${password}`);
}

function buildHeaders(): HeadersInit {
  return {
    Authorization: buildAuthHeader(),
    'Content-Type': 'application/json',
  };
}

function isPriorityError(body: unknown): body is PriorityErrorResponse {
  return (
    typeof body === 'object' &&
    body !== null &&
    'FORM' in body &&
    typeof (body as PriorityErrorResponse).FORM?.InterfaceErrors?.text === 'string'
  );
}

function isODataError(body: unknown): body is ODataErrorResponse {
  return (
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    typeof (body as ODataErrorResponse).error?.message === 'string'
  );
}

function cleanErrorText(raw: string): string {
  return raw
    .replace(/שורה\s*\d+[-\s]*/g, '')
    .replace(/[n\\]+/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function extractErrorMessage(body: unknown): string | null {
  if (isPriorityError(body)) {
    return cleanErrorText(body.FORM.InterfaceErrors.text);
  }
  if (isODataError(body)) {
    return body.error.message;
  }
  return null;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorBody: unknown = await response.json();
      const extracted = extractErrorMessage(errorBody);
      if (extracted) {
        errorMessage = extracted;
      }
    } catch {
      // response body not parseable — use status text
    }
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
}

export async function getAllTasks(signal?: AbortSignal): Promise<CustnotesaResponse[]> {
  const url = `${getApiBaseUrl()}/CUSTNOTESA`;
  const response = await fetch(url, {
    method: 'GET',
    headers: buildHeaders(),
    signal,
  });
  const data = await handleResponse<ODataCollectionResponse<CustnotesaResponse>>(response);
  return data.value;
}

export async function createTask(payload: CreateTaskPayload): Promise<CustnotesaResponse> {
  const url = `${getApiBaseUrl()}/CUSTNOTESA`;
  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<CustnotesaResponse>(response);
}

export async function updateTask(custnote: number, payload: UpdateTaskPayload): Promise<CustnotesaResponse> {
  const url = `${getApiBaseUrl()}/CUSTNOTESA(${custnote})`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<CustnotesaResponse>(response);
}

export async function deleteTask(custnote: number): Promise<void> {
  const url = `${getApiBaseUrl()}/CUSTNOTESA(${custnote})`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorBody: unknown = await response.json();
      const extracted = extractErrorMessage(errorBody);
      if (extracted) {
        errorMessage = extracted;
      }
    } catch {
      // response body not parseable
    }
    throw new Error(errorMessage);
  }
}
