import Link from 'next/link';
import { Navigation } from '@/components/Navigation/Navigation';
import { Search } from '@/components/Search/Search';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { Player } from '@/components/Player/Player';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className="wrapper">
      <div className="container">
        <main className="main">
          <Navigation />
          <div className={styles.centerblock}>
            <Search />
            <div className={styles.errorContent}>
              <h1 className={styles.errorTitle}>404</h1>
              <h2 className={styles.errorSubtitle}>Страница не найдена 😳</h2>
              <p className={styles.errorText}>
                Возможно, она была удалена
                <br />
                или перенесена на другой адрес
              </p>
              <Link href="/" className={styles.backButton}>
                Вернуться на главную
              </Link>
            </div>
          </div>
          <Sidebar />
        </main>
        <Player />
        <footer className="footer"></footer>
      </div>
    </div>
  );
}
