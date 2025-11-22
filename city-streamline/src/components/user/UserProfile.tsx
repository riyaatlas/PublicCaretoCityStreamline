import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

const UserProfile = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiClient('/user/me', { method: 'GET' });
        setUserData(data);
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

  if (!userData) {
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
        <CardTitle>My Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Username</p>
            <p>{userData.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p>{userData.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Phone</p>
            <p>{userData.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Address</p>
            <p>{userData.address}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
