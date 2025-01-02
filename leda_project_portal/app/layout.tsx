import '@/app/ui/globals.css';
import { Metadata } from 'next';


export const metadata: Metadata = {
  title: {
    template: '%s | LEDA Project Portal',
    default: 'LEDA Portal',
  },
  description: 'The official Next.js Learn Dashboard built with App Router.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
  
}