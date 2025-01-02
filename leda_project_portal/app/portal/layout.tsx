import '@/app/ui/globals.css';
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