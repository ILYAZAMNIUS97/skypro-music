'use client';

import Image from 'next/image';
import styles from '@/app/auth/signup.module.css';
import classNames from 'classnames';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  clearAuthError,
  clearRegistrationMessage,
  registerUser,
} from '@/store/authSlice';

export default function SignUp() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status, error, registrationMessage, fieldErrors } = useAppSelector(
    (state) => state.auth,
  );

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrorsState, setFieldErrorsState] = useState<
    Record<string, string[]>
  >({});

  const isLoading = status === 'loading';

  useEffect(() => {
    if (error) {
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        const [baseMessage] = error.split(':');
        setLocalError((baseMessage ?? error).trim());
      } else {
        setLocalError(error);
      }
    } else {
      setLocalError(null);
    }
  }, [error, fieldErrors]);

  useEffect(() => {
    if (registrationMessage) {
      setSuccessMessage(registrationMessage);
      setLocalError(null);
      setFieldErrorsState({});
      const timeout = setTimeout(() => {
        router.push('/auth/signin?registered=1');
        dispatch(clearRegistrationMessage());
      }, 1500);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [registrationMessage, router, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
      dispatch(clearRegistrationMessage());
    };
  }, [dispatch]);

  useEffect(() => {
    if (fieldErrors) {
      setFieldErrorsState(fieldErrors);
    } else {
      setFieldErrorsState({});
    }
  }, [fieldErrors]);

  const clearFieldError = (field: string) => {
    setFieldErrorsState((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);
    setFieldErrorsState({});

    const usernamePattern = /^[A-Za-z0-9@.+\-_]+$/;

    if (
      !email.trim() ||
      !username.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setLocalError('Заполните все поля.');
      return;
    }

    if (!usernamePattern.test(username.trim())) {
      setLocalError(
        'Имя пользователя может содержать только латиницу, цифры и символы @ . + - _',
      );
      setFieldErrorsState({
        username: [
          'Имя пользователя может содержать только латиницу, цифры и символы @ . + - _',
        ],
      });
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Пароли не совпадают.');
      return;
    }

    try {
      await dispatch(
        registerUser({
          email: email.trim(),
          password: password.trim(),
          username: username.trim(),
        }),
      ).unwrap();
    } catch (registerError) {
      if (registerError instanceof Error) {
        setLocalError(registerError.message);
      } else if (typeof registerError === 'string') {
        setLocalError(registerError);
      } else {
        setLocalError('Не удалось завершить регистрацию. Попробуйте снова.');
      }
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.containerEnter}>
        <div className={styles.modal__block}>
          <form className={styles.modal__form} onSubmit={handleSubmit}>
            <Link href="/">
              <div className={styles.modal__logo}>
                <Image
                  src="/img/logo_modal.png"
                  alt="logo"
                  width={140}
                  height={21}
                />
              </div>
            </Link>
            <input
              className={classNames(styles.modal__input, styles.login)}
              type="email"
              name="email"
              placeholder="Почта"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setLocalError(null);
                setSuccessMessage(null);
                clearFieldError('email');
              }}
              autoComplete="email"
              disabled={isLoading}
            />
            {fieldErrorsState.email?.map((msg, index) => (
              <span className={styles.fieldError} key={`email-${index}`}>
                {msg}
              </span>
            ))}
            <input
              className={styles.modal__input}
              type="text"
              name="username"
              placeholder="Имя пользователя"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setLocalError(null);
                setSuccessMessage(null);
                clearFieldError('username');
              }}
              autoComplete="username"
              disabled={isLoading}
            />
            {fieldErrorsState.username?.map((msg, index) => (
              <span className={styles.fieldError} key={`username-${index}`}>
                {msg}
              </span>
            ))}
            <input
              className={styles.modal__input}
              type="password"
              name="password"
              placeholder="Пароль"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setLocalError(null);
                setSuccessMessage(null);
                clearFieldError('password');
              }}
              autoComplete="new-password"
              disabled={isLoading}
            />
            {fieldErrorsState.password?.map((msg, index) => (
              <span className={styles.fieldError} key={`password-${index}`}>
                {msg}
              </span>
            ))}
            <input
              className={styles.modal__input}
              type="password"
              name="confirmPassword"
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setLocalError(null);
                setSuccessMessage(null);
                clearFieldError('confirmPassword');
              }}
              autoComplete="new-password"
              disabled={isLoading}
            />
            <div className={styles.errorContainer}>
              {localError && (
                <span className={styles.errorText}>{localError}</span>
              )}
              {!localError && successMessage && (
                <span className={styles.successText}>{successMessage}</span>
              )}
            </div>
            <button
              className={styles.modal__btnSignupEnt}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Регистрируем...' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
