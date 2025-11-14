'use client';

import Image from 'next/image';
import styles from '@/app/auth/signin.module.css';
import classNames from 'classnames';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAuthError, loginUser } from '@/store/authSlice';

export default function Signin() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, error, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const isLoading = status === 'loading';

  useEffect(() => {
    const registered = searchParams.get('registered');
    if (registered) {
      toast.success('Регистрация прошла успешно. Авторизуйтесь.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      toast.error(error);
    } else {
      setLocalError(null);
    }
  }, [error]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    setInfoMessage(null);

    if (!email.trim() || !password.trim()) {
      const errorMsg = 'Заполните почту и пароль.';
      setLocalError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      await dispatch(
        loginUser({ email: email.trim(), password: password.trim() }),
      ).unwrap();
      toast.success('Вход выполнен успешно!');
      router.push('/');
    } catch (loginError) {
      const errorMessage =
        loginError instanceof Error
          ? loginError.message
          : typeof loginError === 'string'
            ? loginError
            : 'Не удалось выполнить вход. Попробуйте снова.';
      setLocalError(errorMessage);
      toast.error(errorMessage);
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
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={isLoading}
            />
            <input
              className={classNames(styles.modal__input)}
              type="password"
              name="password"
              placeholder="Пароль"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              disabled={isLoading}
            />
            <div className={styles.errorContainer}>
              {localError && (
                <span className={styles.errorText}>{localError}</span>
              )}
              {!localError && infoMessage && (
                <span className={styles.infoText}>{infoMessage}</span>
              )}
            </div>
            <button
              className={styles.modal__btnEnter}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Входим...' : 'Войти'}
            </button>
            <Link href="/auth/signup" className={styles.modal__btnSignup}>
              Зарегистрироваться
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
