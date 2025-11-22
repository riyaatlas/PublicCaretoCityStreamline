import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, MapPin, Shield, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

const AdminProfile = () => {
  const [adminData, setAdminData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiClient('/admin/me', { method: 'GET' });
        setAdminData(data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminData) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Failed to load profile
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Username</p>
            <p>{adminData.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p>{adminData.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Phone</p>
            <p>{adminData.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Address</p>
            <p>{adminData.address}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Role</p>
            <p className="capitalize">{adminData.role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminProfile;
