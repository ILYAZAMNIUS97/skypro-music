import { type ReactNode } from 'react';
import { Navigation } from '@/components/Navigation/Navigation';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { Player } from '@/components/Player/Player';
import { TokenInitializer } from '@/components/TokenInitializer/TokenInitializer';

interface PageTemplateProps {
  children: ReactNode;
}

export const PageTemplate = ({ children }: PageTemplateProps) => {
  return (
    <div className="wrapper">
      <TokenInitializer />
      <div className="container">
        <main className="main">
          <Navigation />
          {children}
          <Sidebar />
        </main>
        <Player />
        <footer className="footer"></footer>
      </div>
    </div>
  );
};
