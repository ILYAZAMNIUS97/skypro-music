import { Navigation } from '@/components/Navigation/Navigation';
import { MainContent } from '@/components/MainContent/MainContent';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { Player } from '@/components/Player/Player';
import { TokenInitializer } from '@/components/TokenInitializer/TokenInitializer';

export default function Home() {
  return (
    <div className="wrapper">
      <TokenInitializer />
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
