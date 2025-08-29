import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

// Import AG Grid setup to register modules
import '@/lib/ag-grid-setup';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ramp Dashboard - Expense Management',
  description: 'Enterprise-ready dashboard for managing Ramp expenses with advanced filtering and export capabilities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}