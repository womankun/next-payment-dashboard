import AppSidebar from "@/components/sidemenu/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const MainLayout = ({
    children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className='flex h-screen'>
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
      <main className='bg-slate-50 flex-1 over-flow-auto'>{children}</main>
    </div>
  );
}

export default MainLayout