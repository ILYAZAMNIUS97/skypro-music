import { Navigation } from '@/components/Navigation/Navigation';
import { MainContent } from '@/components/MainContent/MainContent';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { Player } from '@/components/Player/Player';

export default function Home() {
  return (
    <div className="wrapper">
      <div className="container">
        <main className="main">
          <Navigation />
          <MainContent />
          <Sidebar />
        </main>
        <Player />
        <footer className="footer"></footer>
      </div>
    </div>
  );
}
