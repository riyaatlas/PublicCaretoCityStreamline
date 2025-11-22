// API configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Auth token management
export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token: string) => localStorage.setItem('token', token);
export const removeAuthToken = () => localStorage.removeItem('token');
export const getUserRole = () => localStorage.getItem('userRole');
export const setUserRole = (role: string) => localStorage.setItem('userRole', role);
export const removeUserRole = () => localStorage.removeItem('userRole');

// API client with auth header
export const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// Geocoding utilities using OpenStreetMap Nominatim API
export const reverseGeocode = async (lat: number, lon: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
    );
    const data = await response.json();
    
    const address = data.address || {};
    return {
      house_no: address.house_number || '',
      street: address.road || address.street || '',
      city: address.city || address.town || address.village || '',
      state: address.state || '',
      pin: address.postcode || '',
      formatted: data.display_name || '',
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    throw new Error('Failed to get address from coordinates');
  }
};

export const forwardGeocode = async (address: {
  house_no: string;
  street: string;
  city: string;
  state: string;
  pin: string;
}) => {
  try {
    const query = `${address.house_no} ${address.street}, ${address.city}, ${address.state} ${address.pin}`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    throw new Error('Location not found');
  } catch (error) {
    console.error('Forward geocoding failed:', error);
    throw new Error('Failed to get coordinates from address');
  }
};

export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Failed to get location: ${error.message}`));
      }
    );
  });
};
