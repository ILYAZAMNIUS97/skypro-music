import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import '@/app/globals.css';
import { ReduxProvider } from '@/components/ReduxProvider/ReduxProvider';
import ConsoleSilencer from '@/components/ConsoleSilencer';
import { ToastProvider } from '@/components/ToastProvider';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SkyPro Music',
  description: 'Музыкальный плеер SkyPro Music',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={montserrat.variable}>
        <ConsoleSilencer />
        <ReduxProvider>
          {children}
          <ToastProvider />
        </ReduxProvider>
      </body>
    </html>
  );
}
