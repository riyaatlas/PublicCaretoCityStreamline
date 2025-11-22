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
import { User, FileText, Search, LogOut } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { removeAuthToken, removeUserRole, getUserRole } from '@/lib/api';
import RaiseComplaint from '@/components/user/RaiseComplaint';
import TrackComplaints from '@/components/user/TrackComplaints';
import UserProfile from '@/components/user/UserProfile';

type View = 'raise' | 'track' | 'profile';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<View>('raise');

  useEffect(() => {
    const role = getUserRole();
    if (role !== 'user') {
      navigate('/auth');
    }
  }, [navigate]);

  const handleLogout = () => {
    removeAuthToken();
    removeUserRole();
    navigate('/auth');
  };

  const menuItems = [
    { id: 'raise' as View, title: 'Raise Complaint', icon: FileText },
    { id: 'track' as View, title: 'Track Complaints', icon: Search },
    { id: 'profile' as View, title: 'My Profile', icon: User },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar>
          <div className="p-4 border-b border-sidebar-border">
            <h2 className="text-xl font-bold text-sidebar-foreground">PublicCare</h2>
            <p className="text-sm text-sidebar-foreground/70">User Portal</p>
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
            <h1 className="text-2xl font-bold">
              {menuItems.find((item) => item.id === currentView)?.title}
            </h1>
          </header>

          <div className="p-6">
            {currentView === 'raise' && <RaiseComplaint />}
            {currentView === 'track' && <TrackComplaints />}
            {currentView === 'profile' && <UserProfile />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default UserDashboard;
