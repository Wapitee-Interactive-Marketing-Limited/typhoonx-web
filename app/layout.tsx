import './globals.css';
import { Nunito_Sans } from 'next/font/google';

export const metadata = { title: 'TyphoonX' };

const nunitoSans = Nunito_Sans({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`min-h-dvh ${nunitoSans.className}`}>{children}</body>
    </html>
  );
}

