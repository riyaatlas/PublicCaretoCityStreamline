import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiClient, getCurrentLocation, reverseGeocode, forwardGeocode } from '@/lib/api';
import { MapPin, Loader2 } from 'lucide-react';

const RaiseComplaint = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    use_my_address: false,
    address: '',
    house_no: '',
    street: '',
    city: '',
    state: '',
    pin: '',
    latitude: 0,
    longitude: 0,
  });

  const handleUseMyAddress = () => {
    setFormData({
      ...formData,
      use_my_address: true,
    });
    toast.success('Using your saved address');
  };

  const handleUseCurrentLocation = async () => {
    setIsLocationLoading(true);
    try {
      const { latitude, longitude } = await getCurrentLocation();
      const addressData = await reverseGeocode(latitude, longitude);

      setFormData({
        ...formData,
        use_my_address: false,
        house_no: addressData.house_no,
        street: addressData.street,
        city: addressData.city,
        state: addressData.state,
        pin: addressData.pin,
        latitude,
        longitude,
        address: addressData.formatted,
      });

      toast.success('Location detected successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to get current location');
    } finally {
      setIsLocationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error('Please enter a complaint description');
      return;
    }

    if (!formData.use_my_address && (!formData.city || !formData.state || !formData.pin)) {
      toast.error('Please provide complete address details');
      return;
    }

    setIsLoading(true);
    try {
      let submitData: any = {
        description: formData.description,
        use_my_address: formData.use_my_address,
      };

      if (!formData.use_my_address) {
        // If coordinates not set (manual entry), geocode the address
        if (formData.latitude === 0 && formData.longitude === 0) {
          const coords = await forwardGeocode({
            house_no: formData.house_no,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            pin: formData.pin,
          });
          formData.latitude = coords.latitude;
          formData.longitude = coords.longitude;
        }

        submitData.address = `${formData.house_no} ${formData.street}, ${formData.city}, ${formData.state} ${formData.pin}`.trim();
        submitData.latitude = formData.latitude;
        submitData.longitude = formData.longitude;
      }

      const response = await apiClient('/user/raise', {
        method: 'POST',
        body: JSON.stringify(submitData),
      });

      toast.success('Complaint submitted successfully!');

      // Reset form
      setFormData({
        description: '',
        use_my_address: false,
        address: '',
        house_no: '',
        street: '',
        city: '',
        state: '',
        pin: '',
        latitude: 0,
        longitude: 0,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit complaint');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Raise a Complaint</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Complaint Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the issue in detail..."
              rows={5}
              className="resize-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Location Details</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUseMyAddress}
                >
                  Use My Address
                </Button>
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
            </div>

            {!formData.use_my_address && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="house">House No / Building</Label>
                  <Input
                    id="house"
                    value={formData.house_no}
                    onChange={(e) => setFormData({ ...formData, house_no: e.target.value })}
                    placeholder="123, Apartment Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="Main Street"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pin">PIN Code *</Label>
                  <Input
                    id="pin"
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    placeholder="123456"
                  />
                </div>
              </div>
            )}

            {formData.use_my_address && (
              <p className="text-sm text-muted-foreground">
                Your saved address will be used for this complaint.
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : 'Submit Complaint'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RaiseComplaint;
