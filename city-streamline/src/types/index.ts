export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  address: string;
  city: string;
  state: string;
  pin: string;
  latitude: number;
  longitude: number;
}

export interface Complaint {
  id: number;
  user_id: number;
  description: string;
  department: string;
  priority_score: number;
  priority_level: string;
  status: 'Active' | 'In Progress' | 'Resolved';
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  group_id?: string;
}

export interface ComplaintGroup {
  group_id: string;
  complaints: Complaint[];
  center_lat?: number;
  center_lon?: number;
}

export type Department = 'Healthcare' | 'Water Supply' | 'Electricity' | 'Waste Management' | 'Roads';
