import { OrderStatus, UserRole, VehicleType } from '@/types';

export const mockUsers = [
  {
    id: 'user1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1234567890',
    password: 'password123',
    role: 'orderer' as UserRole,
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
    address: '123 Main St, New York, NY',
    providers: ['email', 'google', 'phone'],
  },
  {
    id: 'user2',
    name: 'Maria Rodriguez',
    email: 'maria.rodriguez@example.com',
    phone: '+0987654321',
    password: 'password123',
    role: 'transporter' as UserRole,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    address: '456 Transport Ave, Chicago, IL',
    providers: ['email', 'microsoft'],
    vehicles: [
      {
        id: 'v1',
        type: 'truck' as VehicleType,
        model: 'Ford F-650',
        licensePlate: 'TR-1234',
        maxWeight: 10000, // in kg
        maxVolume: 45, // in cubic meters
        currentLocation: {
          latitude: 41.8781,
          longitude: -87.6298,
          address: 'Chicago, IL',
        },
        available: true,
      },
      {
        id: 'v2',
        type: 'van' as VehicleType,
        model: 'Mercedes Sprinter',
        licensePlate: 'TR-5678',
        maxWeight: 3500, // in kg
        maxVolume: 14, // in cubic meters
        currentLocation: {
          latitude: 41.8339,
          longitude: -87.8720,
          address: 'Oak Park, IL',
        },
        available: true,
      }
    ],
  }
];

export const mockOrders = [
  {
    id: 'order1',
    ordererId: 'user1',
    status: 'pending' as OrderStatus,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    pickupLocation: {
      address: '123 Main St, New York, NY',
      latitude: 40.7128,
      longitude: -74.0060,
    },
    deliveryLocation: {
      address: '456 Delivery Ave, Boston, MA',
      latitude: 42.3601,
      longitude: -71.0589,
    },
    cargo: {
      description: 'Office furniture',
      weight: 750, // in kg
      volume: 8, // in cubic meters
      items: 12,
    },
    price: 450,
    currency: 'USD',
    notes: 'Please handle with care. Fragile items inside.',
    scheduledPickup: new Date(Date.now() + 86400000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 172800000).toISOString(),
  },
  {
    id: 'order2',
    ordererId: 'user1',
    transporterId: 'user2',
    transporterVehicleId: 'v1',
    status: 'accepted' as OrderStatus,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    pickupLocation: {
      address: '789 Pickup St, Chicago, IL',
      latitude: 41.8781,
      longitude: -87.6298,
    },
    deliveryLocation: {
      address: '101 Delivery Rd, Milwaukee, WI',
      latitude: 43.0389,
      longitude: -87.9065,
    },
    cargo: {
      description: 'Construction materials',
      weight: 5000, // in kg
      volume: 20, // in cubic meters
      items: 40,
    },
    price: 850,
    currency: 'USD',
    notes: 'Loading dock available at pickup location.',
    scheduledPickup: new Date(Date.now() + 3600000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 86400000).toISOString(),
    statusUpdates: [
      {
        status: 'created',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        note: 'Order created',
      },
      {
        status: 'accepted',
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        note: 'Order accepted by transporter',
      }
    ]
  },
  {
    id: 'order3',
    ordererId: 'user1',
    transporterId: 'user2',
    transporterVehicleId: 'v2',
    status: 'in_transit' as OrderStatus,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    pickupLocation: {
      address: '222 Start St, Detroit, MI',
      latitude: 42.3314,
      longitude: -83.0458,
    },
    deliveryLocation: {
      address: '333 End Ave, Cleveland, OH',
      latitude: 41.4993,
      longitude: -81.6944,
    },
    cargo: {
      description: 'Electronics',
      weight: 1200, // in kg
      volume: 6, // in cubic meters
      items: 30,
    },
    price: 620,
    currency: 'USD',
    notes: 'Signature required upon delivery.',
    scheduledPickup: new Date(Date.now() - 43200000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 43200000).toISOString(),
    currentLocation: {
      latitude: 41.9399,
      longitude: -82.2431,
      address: 'Toledo, OH',
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    statusUpdates: [
      {
        status: 'created',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        note: 'Order created',
      },
      {
        status: 'accepted',
        timestamp: new Date(Date.now() - 129600000).toISOString(),
        note: 'Order accepted by transporter',
      },
      {
        status: 'pickup',
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        note: 'Cargo picked up',
      },
      {
        status: 'in_transit',
        timestamp: new Date(Date.now() - 36000000).toISOString(),
        note: 'Shipment in transit',
      }
    ]
  }
];