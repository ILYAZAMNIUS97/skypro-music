import { API_BASE_URL } from './api';
import { type AuthResponse, type User } from '@/types/user';

export type FieldErrors = Record<string, string[]>;

export interface ApiError extends Error {
  fieldErrors?: FieldErrors;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  username: string;
}

export interface SignupResponse {
  message: string;
  result: {
    username: string;
    email: string;
    _id: number;
  };
  success: boolean;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

const collectErrorMessages = (raw: unknown): string[] => {
  if (!raw) return [];

  if (typeof raw === 'string') {
    return [raw];
  }

  if (Array.isArray(raw)) {
    return raw.flatMap((item) => collectErrorMessages(item));
  }

  if (typeof raw === 'object') {
    return Object.values(raw).flatMap((value) => collectErrorMessages(value));
  }

  return [];
};

const extractFieldErrors = (raw: unknown): FieldErrors | null => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const result: FieldErrors = {};
  Object.entries(raw as Record<string, unknown>).forEach(([key, value]) => {
    const messages = collectErrorMessages(value);
    if (messages.length > 0) {
      result[key] = messages;
    }
  });

  return Object.keys(result).length > 0 ? result : null;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => undefined);

  if (!response.ok) {
    const baseMessage =
      (data && typeof data === 'object' && 'message' in data
        ? (data as { message?: string }).message
        : undefined) ||
      (data && typeof data === 'object' && 'detail' in data
        ? (data as { detail?: string }).detail
        : undefined) ||
      `Ошибка запроса: ${response.status}`;

    let detailedMessage = baseMessage;

    let fieldErrors: FieldErrors | null = null;

    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      let errorsCandidate: unknown;

      if ('errors' in record) {
        errorsCandidate = record.errors;
      } else if ('data' in record) {
        const nested = record.data;
        if (nested && typeof nested === 'object' && 'errors' in nested) {
          errorsCandidate = (nested as Record<string, unknown>).errors;
        }
      }

      const messages = collectErrorMessages(errorsCandidate);
      if (messages.length > 0) {
        detailedMessage = `${baseMessage}: ${messages.join('; ')}`;
      }

      fieldErrors = extractFieldErrors(errorsCandidate);
    }

    const errorObject = new Error(detailedMessage) as ApiError;
    if (fieldErrors) {
      errorObject.fieldErrors = fieldErrors;
    }

    throw errorObject;
  }

  return data as T;
};

const mapAuthResponseToUser = (auth: AuthResponse): User => ({
  id: auth._id,
  email: auth.email,
  username: auth.username,
});

export const authApi = {
  signup: async (payload: SignupPayload): Promise<SignupResponse> => {
    const response = await fetch(`${API_BASE_URL}/user/signup/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        username: payload.username,
      }),
    });

    return handleResponse<SignupResponse>(response);
  },

  login: async (payload: LoginPayload): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/user/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
      }),
    });

    const data = await handleResponse<AuthResponse>(response);
    return mapAuthResponseToUser(data);
  },

  getTokens: async (payload: LoginPayload): Promise<TokenResponse> => {
    const response = await fetch(`${API_BASE_URL}/user/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
      }),
    });

    return handleResponse<TokenResponse>(response);
  },

  refreshTokens: async (refresh: string): Promise<{ access: string }> => {
    const response = await fetch(`${API_BASE_URL}/user/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });

    return handleResponse<{ access: string }>(response);
  },
};
