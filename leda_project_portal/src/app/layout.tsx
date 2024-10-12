import '@/src/app/ui/globals.css';
import { inter } from '@/src/app/ui/fonts';
import { Metadata } from 'next';
import SideNav from './ui/sidenav/sidenav';

export const metadata: Metadata = {
  title: {
    template: '%s | LEDA Portal',
    default: 'LEDA Portal',
  },
  description: 'The official Next.js Learn Dashboard built with App Router.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
              <div className="w-full flex-none md:w-64">
                  <SideNav />
              </div>
              <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
        </div>
        
      </body>
    </html>
  );
}