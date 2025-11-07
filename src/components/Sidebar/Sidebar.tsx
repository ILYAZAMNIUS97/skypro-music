import Image from 'next/image';
import Link from 'next/link';
import styles from './Sidebar.module.css';
import { SELECTIONS_CONFIG } from '@/utils/selectionConfig';

export const Sidebar = () => {
  const selections = Object.entries(SELECTIONS_CONFIG);

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarPersonal}>
        <p className={styles.sidebarPersonalName}>Sergey.Ivanov</p>
        <div className={styles.sidebarIcon}>
          <svg className={styles.sidebarIconSvg}>
            <use href="/img/icon/sprite.svg#logout"></use>
          </svg>
        </div>
      </div>
      <div className={styles.sidebarBlock}>
        <div className={styles.sidebarList}>
          {selections.map(([slug, config]) => (
            <div className={styles.sidebarItem} key={slug}>
              <Link className={styles.sidebarLink} href={`/playlist/${slug}`}>
                <Image
                  className={styles.sidebarImg}
                  src={config.imageSrc}
                  alt={config.imageAlt}
                  fill
                  sizes="250px"
                />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
