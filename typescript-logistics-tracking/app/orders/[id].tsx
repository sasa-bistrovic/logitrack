import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  MapPin, 
  Package, 
  Calendar, 
  Truck, 
  Clock, 
  DollarSign,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react-native';
import { useOrderStore } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { StatusTimeline } from '@/components/StatusTimeline';
import MapView from '@/components/MapView';
import { formatDate, formatCurrency, getStatusColor } from '@/utils/helpers';
import { geocodeAddress } from '@/utils/geocoding';
import { Order, OrderStatus, User, Vehicle, Location as LocationType } from '@/types';
import { mockUsers } from '@/constants/mockData';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const { getOrderById, updateOrderStatus, isLoading } = useOrderStore();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [transporter, setTransporter] = useState<User | undefined>(undefined);
  const [vehicle, setVehicle] = useState<Vehicle | undefined>(undefined);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [geocodedLocations, setGeocodedLocations] = useState<{
    pickup?: LocationType;
    delivery?: LocationType;
    current?: LocationType;
  }>({});
  
  // Use a ref to track initial mount
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    if (id) {
      const orderData = getOrderById(id);
      setOrder(orderData);
      
      // Find transporter and vehicle if available
      if (orderData?.transporterId) {
        const transporterData = mockUsers.find(u => u.id === orderData.transporterId);
        setTransporter(transporterData);
        
        if (orderData.transporterVehicleId && transporterData?.vehicles) {
          const vehicleData = transporterData.vehicles.find(v => v.id === orderData.transporterVehicleId);
          setVehicle(vehicleData);
        }
      }
      
      // Geocode addresses if needed
      if (orderData) {
        geocodeOrderAddresses(orderData);
      }
    }
  }, [id, getOrderById]);
  
  const geocodeOrderAddresses = async (orderData: Order) => {
    setIsGeocodingLoading(true);
    
    try {
      const locations: {
        pickup?: LocationType;
        delivery?: LocationType;
        current?: LocationType;
      } = {};
      
      // Geocode pickup location if it doesn't have coordinates
      if (orderData.pickupLocation && 
          (!orderData.pickupLocation.latitude || !orderData.pickupLocation.longitude)) {
        const pickupCoords = await geocodeAddress(orderData.pickupLocation.address);
        if (pickupCoords) {
          locations.pickup = {
            ...orderData.pickupLocation,
            ...pickupCoords
          };
        }
      } else {
        locations.pickup = orderData.pickupLocation;
      }
      
      // Geocode delivery location if it doesn't have coordinates
      if (orderData.deliveryLocation && 
          (!orderData.deliveryLocation.latitude || !orderData.deliveryLocation.longitude)) {
        const deliveryCoords = await geocodeAddress(orderData.deliveryLocation.address);
        if (deliveryCoords) {
          locations.delivery = {
            ...orderData.deliveryLocation,
            ...deliveryCoords
          };
        }
      } else {
        locations.delivery = orderData.deliveryLocation;
      }
      
      // Geocode current location if it exists and doesn't have coordinates
      if (orderData.currentLocation && 
          (!orderData.currentLocation.latitude || !orderData.currentLocation.longitude)) {
        const currentCoords = await geocodeAddress(orderData.currentLocation.address);
        if (currentCoords) {
          locations.current = {
            ...orderData.currentLocation,
            ...currentCoords
          };
        }
      } else if (orderData.currentLocation) {
        locations.current = orderData.currentLocation;
      }
      
      setGeocodedLocations(locations);
    } catch (error) {
      console.error('Error geocoding addresses:', error);
    } finally {
      setIsGeocodingLoading(false);
    }
  };
  
  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!order || !id) return;
    
    try {
      await updateOrderStatus(id, newStatus);
      // Refresh order data
      const updatedOrder = getOrderById(id);
      setOrder(updatedOrder);
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };
  
  const renderStatusActions = () => {
    if (!order || !user) return null;
    
    // Orderer can only cancel pending orders
    if (user.role === 'orderer' && order.ordererId === user.id) {
      if (order.status === 'pending') {
        return (
          <Button 
            title="Cancel Order" 
            variant="outline"
            leftIcon={<XCircle size={20} color={colors.danger} />}
            onPress={() => handleUpdateStatus('cancelled')}
            isLoading={isLoading}
            style={styles.cancelButton}
            textStyle={{ color: colors.danger }}
          />
        );
      }
      return null;
    }
    
    // Transporter actions based on current status
    if (user.role === 'transporter') {
      switch (order.status) {
        case 'pending':
          return (
            <Button 
              title="Accept Order" 
              leftIcon={<CheckCircle size={20} color={colors.white} />}
              onPress={() => handleUpdateStatus('accepted')}
              isLoading={isLoading}
            />
          );
        case 'accepted':
          return (
            <Button 
              title="Mark as Picked Up" 
              leftIcon={<Truck size={20} color={colors.white} />}
              onPress={() => handleUpdateStatus('pickup')}
              isLoading={isLoading}
            />
          );
        case 'pickup':
          return (
            <Button 
              title="Start Transit" 
              leftIcon={<Truck size={20} color={colors.white} />}
              onPress={() => handleUpdateStatus('in_transit')}
              isLoading={isLoading}
            />
          );
        case 'in_transit':
          return (
            <Button 
              title="Mark as Delivered" 
              leftIcon={<CheckCircle size={20} color={colors.white} />}
              onPress={() => handleUpdateStatus('delivered')}
              isLoading={isLoading}
            />
          );
        default:
          return null;
      }
    }
    
    return null;
  };
  
  // Create an order object with geocoded locations for the map
  const getOrderWithGeocodedLocations = () => {
    if (!order) return undefined;
    
    return {
      ...order,
      pickupLocation: geocodedLocations.pickup || order.pickupLocation,
      deliveryLocation: geocodedLocations.delivery || order.deliveryLocation,
      currentLocation: geocodedLocations.current || order.currentLocation,
    };
  };
  
  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading order details...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>Order #{order.id.slice(-4)}</Text>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(order.status) }
            ]}>
              <Text style={styles.statusText}>
                {order.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.date}>Created on {formatDate(order.createdAt)}</Text>
        </View>
        
        <View style={styles.mapSection}>
          {isGeocodingLoading ? (
            <View style={styles.mapLoading}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.mapLoadingText}>Loading map data...</Text>
            </View>
          ) : (
            <MapView order={getOrderWithGeocodedLocations()} />
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Locations</Text>
          
          <View style={styles.card}>
            <View style={styles.locationItem}>
              <View style={[styles.locationIcon, { backgroundColor: colors.primaryLight }]}>
                <MapPin size={20} color={colors.primary} />
              </View>
              <View style={styles.locationContent}>
                <Text style={styles.locationLabel}>Pickup Location</Text>
                <Text style={styles.locationAddress}>{order.pickupLocation.address}</Text>
                <Text style={styles.locationTime}>
                  {formatDate(order.scheduledPickup, true)}
                </Text>
              </View>
            </View>
            
            <View style={styles.locationConnector} />
            
            <View style={styles.locationItem}>
              <View style={[styles.locationIcon, { backgroundColor: colors.secondaryLight }]}>
                <MapPin size={20} color={colors.secondary} />
              </View>
              <View style={styles.locationContent}>
                <Text style={styles.locationLabel}>Delivery Location</Text>
                <Text style={styles.locationAddress}>{order.deliveryLocation.address}</Text>
                <Text style={styles.locationTime}>
                  {formatDate(order.estimatedDelivery, true)}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cargo Details</Text>
          
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Package size={16} color={colors.gray} />
                <Text style={styles.detailText}>
                  {order.cargo.description}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailsGrid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Weight</Text>
                <Text style={styles.gridValue}>{order.cargo.weight} kg</Text>
              </View>
              
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Volume</Text>
                <Text style={styles.gridValue}>{order.cargo.volume} m³</Text>
              </View>
              
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Items</Text>
                <Text style={styles.gridValue}>{order.cargo.items}</Text>
              </View>
              
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Price</Text>
                <Text style={styles.gridValue}>
                  {formatCurrency(order.price, order.currency)}
                </Text>
              </View>
            </View>
            
            {order.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText}>{order.notes}</Text>
              </View>
            )}
          </View>
        </View>
        
        {order.transporterId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transport Details</Text>
            
            <View style={styles.card}>
              <View style={styles.transporterInfo}>
                <View style={styles.transporterIcon}>
                  <Truck size={24} color={colors.white} />
                </View>
                <View>
                  <Text style={styles.transporterLabel}>Transporter</Text>
                  <Text style={styles.transporterName}>
                    {transporter?.name || "Unknown Transporter"}
                  </Text>
                </View>
              </View>
              
              {order.transporterVehicleId && (
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleLabel}>Vehicle</Text>
                  <Text style={styles.vehicleValue}>
                    {vehicle ? `${vehicle.model} (${vehicle.licensePlate})` : "Unknown Vehicle"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
        
        {order.statusUpdates && order.statusUpdates.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status Timeline</Text>
            
            <View style={styles.card}>
              <StatusTimeline statusUpdates={order.statusUpdates} />
            </View>
          </View>
        )}
      </ScrollView>
      
      {renderStatusActions() && (
        <View style={styles.actionsContainer}>
          {renderStatusActions()}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  date: {
    fontSize: 14,
    color: colors.textLight,
  },
  mapSection: {
    height: 200,
    width: '100%',
    marginBottom: 16,
  },
  mapLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
  },
  mapLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textLight,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationContent: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  locationTime: {
    fontSize: 14,
    color: colors.textLight,
  },
  locationConnector: {
    width: 2,
    height: 24,
    backgroundColor: colors.primaryLight,
    marginLeft: 20,
    marginBottom: 16,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 16,
    color: colors.text,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  gridItem: {
    width: '50%',
    marginBottom: 16,
  },
  gridLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  notesContainer: {
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
  },
  transporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  transporterIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  transporterLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  transporterName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  vehicleInfo: {
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  vehicleLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  vehicleValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  actionsContainer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    borderColor: colors.danger,
  },
});