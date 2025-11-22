import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { apiClient, setAuthToken, setUserRole, getCurrentLocation, reverseGeocode } from '@/lib/api';
import { MapPin, Loader2 } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  // Login state
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  // Signup state
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    role: 'user' as 'user' | 'admin',
    house_no: '',
    street: '',
    city: '',
    state: '',
    pin: '',
    latitude: 0,
    longitude: 0,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.username || !loginData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
      });

      setAuthToken(response.token);
      setUserRole(response.role);
      toast.success('Login successful!');
      
      if (response.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLocationLoading(true);
    try {
      const { latitude, longitude } = await getCurrentLocation();
      const addressData = await reverseGeocode(latitude, longitude);

      setSignupData(prev => ({
        ...prev,
        house_no: addressData.house_no,
        street: addressData.street,
        city: addressData.city,
        state: addressData.state,
        pin: addressData.pin,
        latitude,
        longitude,
      }));

      toast.success('Location detected successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to get current location');
    } finally {
      setIsLocationLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData.username || !signupData.email || !signupData.password || 
        !signupData.phone || !signupData.city || !signupData.state || !signupData.pin) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // If manual address entry, geocode it
      if (signupData.latitude === 0 && signupData.longitude === 0) {
        const { forwardGeocode } = await import('@/lib/api');
        const coords = await forwardGeocode({
          house_no: signupData.house_no,
          street: signupData.street,
          city: signupData.city,
          state: signupData.state,
          pin: signupData.pin,
        });
        signupData.latitude = coords.latitude;
        signupData.longitude = coords.longitude;
      }

      await apiClient('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData),
      });

      toast.success('Signup successful! Please login.');
      // Switch to login tab
      document.querySelector<HTMLButtonElement>('[data-tab="login"]')?.click();
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">PublicCare</CardTitle>
          <CardDescription>Civic Complaint Management System</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-tab="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    placeholder="Enter your username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Enter your password"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Login'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username *</Label>
                    <Input
                      id="signup-username"
                      value={signupData.username}
                      onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                      placeholder="Choose a username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password *</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      placeholder="Create a password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number *</Label>
                    <Input
                      id="signup-phone"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      placeholder="1234567890"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Role *</Label>
                    <Select value={signupData.role} onValueChange={(value: 'user' | 'admin') => setSignupData({ ...signupData, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Address Details</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUseCurrentLocation}
                      disabled={isLocationLoading}
                    >
                      {isLocationLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4 mr-2" />
                      )}
                      Use Current Location
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-house">House No / Building</Label>
                      <Input
                        id="signup-house"
                        value={signupData.house_no}
                        onChange={(e) => setSignupData({ ...signupData, house_no: e.target.value })}
                        placeholder="123, Apartment Name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-street">Street</Label>
                      <Input
                        id="signup-street"
                        value={signupData.street}
                        onChange={(e) => setSignupData({ ...signupData, street: e.target.value })}
                        placeholder="Main Street"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-city">City *</Label>
                      <Input
                        id="signup-city"
                        value={signupData.city}
                        onChange={(e) => setSignupData({ ...signupData, city: e.target.value })}
                        placeholder="City name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-state">State *</Label>
                      <Input
                        id="signup-state"
                        value={signupData.state}
                        onChange={(e) => setSignupData({ ...signupData, state: e.target.value })}
                        placeholder="State name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-pin">PIN Code *</Label>
                      <Input
                        id="signup-pin"
                        value={signupData.pin}
                        onChange={(e) => setSignupData({ ...signupData, pin: e.target.value })}
                        placeholder="123456"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
