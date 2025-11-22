import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { User, Droplet, Zap, Trash2, Construction, Heart, History, LogOut } from 'lucide-react';
import { removeAuthToken, removeUserRole, getUserRole } from '@/lib/api';
import { Department } from '@/types';
import DepartmentView from '@/components/admin/DepartmentView';
import AdminProfile from '@/components/admin/AdminProfile';
import HistoryView from '@/components/admin/History';

type View = Department | 'profile' | 'history';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<View>('Healthcare');

  useEffect(() => {
    const role = getUserRole();
    if (role !== 'admin') {
      navigate('/auth');
    }
  }, [navigate]);

  const handleLogout = () => {
    removeAuthToken();
    removeUserRole();
    navigate('/auth');
  };

  const menuItems = [
    { id: 'Healthcare' as View, title: 'Healthcare', icon: Heart },
    { id: 'Water Supply' as View, title: 'Water Supply', icon: Droplet },
    { id: 'Electricity' as View, title: 'Electricity', icon: Zap },
    { id: 'Waste Management' as View, title: 'Waste Management', icon: Trash2 },
    { id: 'Roads' as View, title: 'Roads', icon: Construction },
    { id: 'history' as View, title: 'History', icon: History },
    { id: 'profile' as View, title: 'My Profile', icon: User },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar>
          <div className="p-4 border-b border-sidebar-border">
            <h2 className="text-xl font-bold text-sidebar-foreground">PublicCare</h2>
            <p className="text-sm text-sidebar-foreground/70">Admin Portal</p>
          </div>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setCurrentView(item.id)}
                        isActive={currentView === item.id}
                        className="w-full"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto p-4 border-t border-sidebar-border">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 bg-background border-b border-border p-4 flex items-center gap-4">
            <SidebarTrigger />
            {(currentView === 'profile' || currentView === 'history') && (
              <h1 className="text-2xl font-bold">
                {menuItems.find((item) => item.id === currentView)?.title}
              </h1>
            )}
          </header>

          <div className="p-6">
            {currentView === 'profile' && <AdminProfile />}
            {currentView === 'history' && <HistoryView />}
            {currentView !== 'profile' && currentView !== 'history' && (
              <DepartmentView department={currentView as Department} />
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
