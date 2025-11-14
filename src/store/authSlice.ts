import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import {
  authApi,
  type ApiError,
  type FieldErrors,
  type LoginPayload,
  type SignupPayload,
  type SignupResponse,
} from '@/utils/authApi';
import {
  saveTokens,
  clearTokens,
  saveUserToStorage,
  getUserFromStorage,
  clearUserFromStorage,
  getAccessToken,
  getRefreshToken,
} from '@/utils/auth';
import { type User } from '@/types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  registrationMessage: string | null;
  fieldErrors: FieldErrors | null;
  access: string | null;
  refresh: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
  registrationMessage: null,
  fieldErrors: null,
  access: null,
  refresh: null,
};

interface AuthErrorPayload {
  message: string;
  fieldErrors?: FieldErrors | null;
}

export const registerUser = createAsyncThunk<
  SignupResponse,
  SignupPayload,
  { rejectValue: AuthErrorPayload }
>('auth/registerUser', async (payload, { rejectWithValue }) => {
  try {
    const response = await authApi.signup(payload);
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Не удалось зарегистрироваться';

    if (error && typeof error === 'object' && 'fieldErrors' in error) {
      const apiError = error as ApiError;
      return rejectWithValue({
        message,
        fieldErrors: apiError.fieldErrors ?? null,
      });
    }

    return rejectWithValue({ message });
  }
});

export const loginUser = createAsyncThunk<
  User,
  LoginPayload,
  { rejectValue: AuthErrorPayload }
>('auth/loginUser', async (payload, { rejectWithValue }) => {
  try {
    const user = await authApi.login(payload);
    const tokens = await authApi.getTokens(payload);

    saveTokens(tokens.access, tokens.refresh);
    saveUserToStorage(user);

    return user;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Не удалось выполнить вход';

    if (error && typeof error === 'object' && 'fieldErrors' in error) {
      const apiError = error as ApiError;
      return rejectWithValue({
        message,
        fieldErrors: apiError.fieldErrors ?? null,
      });
    }

    return rejectWithValue({ message });
  }
});

export const initializeAuth = createAsyncThunk<
  User | null,
  void,
  { rejectValue: string }
>('auth/initializeAuth', async (_, { rejectWithValue }) => {
  try {
    if (typeof window === 'undefined') {
      return null;
    }

    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    const storedUser = getUserFromStorage();

    if (accessToken && refreshToken && storedUser) {
      return storedUser;
    }

    return null;
  } catch {
    return rejectWithValue('Не удалось восстановить сессию');
  }
});

export const logoutUser = createAsyncThunk<void>(
  'auth/logoutUser',
  async () => {
    clearTokens();
    clearUserFromStorage();
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
      state.fieldErrors = null;
    },
    clearRegistrationMessage: (state) => {
      state.registrationMessage = null;
    },
    updateTokens: (
      state,
      action: PayloadAction<{ access: string; refresh: string }>,
    ) => {
      state.access = action.payload.access;
      state.refresh = action.payload.refresh;
      saveTokens(action.payload.access, action.payload.refresh);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.registrationMessage = null;
        state.fieldErrors = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.registrationMessage = action.payload.message;
        state.fieldErrors = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.payload?.message ?? 'Не удалось зарегистрироваться';
        state.fieldErrors = action.payload?.fieldErrors ?? null;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.fieldErrors = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.fieldErrors = null;
        // Обновляем токены из localStorage
        state.access = getAccessToken();
        state.refresh = getRefreshToken();
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message ?? 'Не удалось выполнить вход';
        state.user = null;
        state.isAuthenticated = false;
        state.fieldErrors = action.payload?.fieldErrors ?? null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
          // Обновляем токены из localStorage
          state.access = getAccessToken();
          state.refresh = getRefreshToken();
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.error = action.payload ?? null;
        state.user = null;
        state.isAuthenticated = false;
        state.fieldErrors = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'idle';
        state.error = null;
        state.fieldErrors = null;
        state.access = null;
        state.refresh = null;
      });
  },
});

export const { clearAuthError, clearRegistrationMessage, updateTokens } =
  authSlice.actions;

export default authSlice.reducer;
