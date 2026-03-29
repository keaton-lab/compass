import type { Metadata } from 'next';
import './globals.css';
import { SettingsProvider } from './contexts/SettingsContext';

export const metadata: Metadata = {
  title: "Compass - 导航中心",
  description: "个人导航中心 - 快速访问常用网站和工具",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧭</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
