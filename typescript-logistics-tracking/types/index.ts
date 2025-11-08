export type UserRole = 'orderer' | 'transporter';

export type VehicleType = 'truck' | 'van' | 'car' | 'motorcycle';

export type OrderStatus = 
  | 'pending' 
  | 'accepted' 
  | 'pickup' 
  | 'in_transit' 
  | 'delivered' 
  | 'cancelled';

export type StatusUpdate = {
  status: string;
  timestamp: string;
  note?: string;
  location?: Location;
};

export type Location = {
  latitude: number;
  longitude: number;
  address: string;
  updatedAt?: string;
};

export type Vehicle = {
  id: string;
  type: VehicleType;
  model: string;
  licensePlate: string;
  maxWeight: number;
  maxVolume: number;
  currentLocation: Location;
  available: boolean;
};

export type Cargo = {
  description: string;
  weight: number;
  volume: number;
  items: number;
};

export type Order = {
  id: string;
  ordererId: string;
  transporterId?: string;
  transporterVehicleId?: string;
  status: OrderStatus;
  createdAt: string;
  pickupLocation: Location;
  deliveryLocation: Location;
  cargo: Cargo;
  price: number;
  currency: string;
  notes?: string;
  scheduledPickup: string;
  estimatedDelivery: string;
  currentLocation?: Location;
  statusUpdates?: StatusUpdate[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  address?: string;
  vehicles?: Vehicle[];
  providers?: string[];
};

export type AuthProvider = 'google' | 'microsoft' | 'apple' | 'phone' | 'email';

export type LoginCredentials = {
  email?: string;
  phone?: string;
  password?: string;
  provider: AuthProvider;
};