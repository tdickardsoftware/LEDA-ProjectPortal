import '@/app/ui/globals.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
        <main>
          <SidebarProvider>
            <AppSidebar />
            <SidebarTrigger />
            {children}
          </SidebarProvider>
        </main>
  );
  
}