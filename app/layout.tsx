import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Apne Aali Game - AAG | Personal Wealth, Career & Asset Engine',
  description: 'Comprehensive personal wealth and finance tracker for cars, properties, bank accounts, appreciating assets (FDs, stocks, crypto, forex), and auto-deducting EMIs and expenses.',
  openGraph: {
    title: 'Apne Aali Game - AAG | Personal Wealth, Career & Asset Engine',
    description: 'Comprehensive personal wealth and finance tracker for cars, properties, bank accounts, appreciating assets (FDs, stocks, crypto, forex), and auto-deducting EMIs and expenses.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apne Aali Game - AAG | Personal Wealth, Career & Asset Engine',
    description: 'Comprehensive personal wealth and finance tracker for cars, properties, bank accounts, appreciating assets (FDs, stocks, crypto, forex), and auto-deducting EMIs and expenses.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
