'use client';

import { useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Sidebar.module.css';
import { SELECTIONS_CONFIG } from '@/utils/selectionConfig';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/authSlice';
import { clearFavoriteTracks } from '@/store/tracksSlice';
import { useRouter } from 'next/navigation';

export const Sidebar = () => {
  const selections = useMemo(() => Object.entries(SELECTIONS_CONFIG), []);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = useCallback(async () => {
    await dispatch(logoutUser());
    dispatch(clearFavoriteTracks());
    router.push('/');
  }, [dispatch, router]);

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarPersonal}>
        <p className={styles.sidebarPersonalName}>
          {isAuthenticated ? user?.username : 'Гость'}
        </p>
        <button
          type="button"
          className={styles.sidebarIcon}
          onClick={handleLogout}
          aria-label="Выйти из аккаунта"
          disabled={!isAuthenticated}
        >
          <svg className={styles.sidebarIconSvg}>
            <use href="/img/icon/sprite.svg#logout"></use>
          </svg>
        </button>
      </div>
      <div className={styles.sidebarBlock}>
        <div className={styles.sidebarList}>
          {selections.map(([slug, config]) => (
            <Link
              className={styles.sidebarItem}
              href={`/playlist/${slug}`}
              key={slug}
            >
              <div className={styles.sidebarLink}>
                <Image
                  className={styles.sidebarImg}
                  src={config.imageSrc}
                  alt={config.imageAlt}
                  fill
                  sizes="250px"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
