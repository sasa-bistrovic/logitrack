import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Order, OrderStatus, StatusUpdate, Location, Vehicle } from '@/types';
import { mockOrders } from '@/constants/mockData';
import { calculateDistance } from '@/utils/helpers';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  updateOrderLocation: (orderId: string, location: Location) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByUser: (userId: string, role?: 'orderer' | 'transporter') => Order[];
  getAvailableOrders: (transporterLocation?: Location, transporterVehicle?: Vehicle, maxDistance?: number) => Order[];
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: mockOrders,
      isLoading: false,
      error: null,
      
      fetchOrders: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In a real app, we would fetch from an API
          // For demo, we're using mock data
          set({ orders: mockOrders, isLoading: false });
        } catch (error) {
          set({ 
            error: 'Failed to fetch orders. Please try again.', 
            isLoading: false 
          });
        }
      },
      
      createOrder: async (orderData) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newOrder: Order = {
            id: `order${Date.now()}`,
            status: 'pending',
            createdAt: new Date().toISOString(),
            ...orderData,
          };
          
          set(state => ({
            orders: [...state.orders, newOrder],
            isLoading: false
          }));
          
          return newOrder;
        } catch (error) {
          set({ 
            error: 'Failed to create order. Please try again.', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      updateOrderStatus: async (orderId, status, note) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const statusUpdate: StatusUpdate = {
            status,
            timestamp: new Date().toISOString(),
            note: note || `Status updated to ${status}`,
          };
          
          set(state => ({
            orders: state.orders.map(order => 
              order.id === orderId 
                ? { 
                    ...order, 
                    status, 
                    statusUpdates: [...(order.statusUpdates || []), statusUpdate] 
                  } 
                : order
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: 'Failed to update order status. Please try again.', 
            isLoading: false 
          });
        }
      },
      
      updateOrderLocation: async (orderId, location) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const updatedLocation: Location = {
            ...location,
            updatedAt: new Date().toISOString(),
          };
          
          set(state => ({
            orders: state.orders.map(order => 
              order.id === orderId 
                ? { ...order, currentLocation: updatedLocation } 
                : order
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: 'Failed to update location. Please try again.', 
            isLoading: false 
          });
        }
      },
      
      getOrderById: (orderId) => {
        return get().orders.find(order => order.id === orderId);
      },
      
      getOrdersByUser: (userId, role) => {
        return get().orders.filter(order => {
          if (role === 'orderer') {
            return order.ordererId === userId;
          } else if (role === 'transporter') {
            return order.transporterId === userId;
          }
          return order.ordererId === userId || order.transporterId === userId;
        });
      },
      
      getAvailableOrders: (transporterLocation, transporterVehicle, maxDistance) => {
        const pendingOrders = get().orders.filter(order => order.status === 'pending');
        
        // If no transporter location provided, just return all pending orders
        if (!transporterLocation || !transporterLocation.latitude || !transporterLocation.longitude) {
          return pendingOrders;
        }
        
        // Calculate distance for each order and add it as a property
        const ordersWithDistance = pendingOrders.map(order => {
          // Skip if pickup location doesn't have coordinates
          if (!order.pickupLocation.latitude || !order.pickupLocation.longitude) {
            return { ...order, distance: Number.MAX_VALUE };
          }
          
          const distance = calculateDistance(
            transporterLocation.latitude,
            transporterLocation.longitude,
            order.pickupLocation.latitude,
            order.pickupLocation.longitude
          );
          
          return { ...order, distance };
        });
        
        // Filter by distance if maxDistance is provided
        let filteredOrders = ordersWithDistance;
        if (maxDistance && maxDistance > 0) {
          filteredOrders = ordersWithDistance.filter(order => 
            (order as any).distance <= maxDistance
          );
        }
        
        // Filter by vehicle capacity if provided
        if (transporterVehicle) {
          filteredOrders = filteredOrders.filter(order => 
            order.cargo.weight <= transporterVehicle.maxWeight &&
            order.cargo.volume <= transporterVehicle.maxVolume
          );
        }
        
        // Sort by distance (closest first)
        return filteredOrders.sort((a, b) => {
          const distanceA = (a as any).distance || Number.MAX_VALUE;
          const distanceB = (b as any).distance || Number.MAX_VALUE;
          return distanceA - distanceB;
        });
      },
    }),
    {
      name: 'order-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);