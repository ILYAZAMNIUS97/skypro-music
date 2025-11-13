'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import classNames from 'classnames';
import { Fade as Hamburger } from 'hamburger-react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/store/authSlice';
import { clearFavoriteTracks } from '@/store/tracksSlice';
import styles from './Navigation.module.css';

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const handleLogout = useCallback(async () => {
    await dispatch(logoutUser());
    dispatch(clearFavoriteTracks());
    setIsMenuOpen(false);
    router.push('/');
  }, [dispatch, router]);

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <Link href="/">
          <Image
            width={113}
            height={17}
            className={styles.logoImage}
            src="/img/logo.png"
            alt="logo"
          />
        </Link>
      </div>
      <div className={styles.burger}>
        <Hamburger
          toggled={isMenuOpen}
          toggle={setIsMenuOpen}
          size={20}
          color="#d3d3d3"
        />
      </div>
      <div
        className={classNames(styles.menu, {
          [styles.menuOpen]: isMenuOpen,
          [styles.menuClosed]: !isMenuOpen,
        })}
      >
        <ul className={styles.menuList}>
          <li className={styles.menuItem}>
            <Link href="/" className={styles.menuLink}>
              Главное
            </Link>
          </li>
          <li className={styles.menuItem}>
            <Link href="/favorite" className={styles.menuLink}>
              Мой плейлист
            </Link>
          </li>
          <li className={styles.menuItem}>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className={styles.menuLink}
                type="button"
              >
                Выйти
              </button>
            ) : (
              <Link href="/auth/signin" className={styles.menuLink}>
                Войти
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};
