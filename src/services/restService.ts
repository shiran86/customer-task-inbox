import { getApiBaseUrl, getCredentials } from '../config';
import type {
  CustnotesaResponse,
  CreateTaskPayload,
  UpdateTaskPayload,
  ODataErrorResponse,
  ODataCollectionResponse,
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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorBody: ODataErrorResponse = await response.json();
      if (errorBody?.error?.message) {
        errorMessage = errorBody.error.message;
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
      const errorBody: ODataErrorResponse = await response.json();
      if (errorBody?.error?.message) {
        errorMessage = errorBody.error.message;
      }
    } catch {
      // response body not parseable
    }
    throw new Error(errorMessage);
  }
}
