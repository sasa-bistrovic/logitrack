import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Truck, MapPin, Weight, Box } from 'lucide-react-native';
import { Vehicle } from '@/types';
import { colors } from '@/constants/colors';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress?: (vehicle: Vehicle) => void;
  selected?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ 
  vehicle, 
  onPress,
  selected = false
}) => {
  const getVehicleIcon = () => {
    switch (vehicle.type) {
      case 'truck':
        return <Truck size={24} color={colors.primary} />;
      case 'van':
        return <Truck size={24} color={colors.primary} />;
      case 'car':
        return <Truck size={24} color={colors.primary} />;
      case 'motorcycle':
        return <Truck size={24} color={colors.primary} />;
      default:
        return <Truck size={24} color={colors.primary} />;
    }
  };
  
  const handlePress = () => {
    if (onPress) {
      onPress(vehicle);
    }
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        selected && styles.selectedContainer,
        !vehicle.available && styles.unavailableContainer
      ]}
      onPress={handlePress}
      disabled={!vehicle.available || !onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {getVehicleIcon()}
        </View>
        <View>
          <Text style={styles.model}>{vehicle.model}</Text>
          <Text style={styles.licensePlate}>{vehicle.licensePlate}</Text>
        </View>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: vehicle.available ? colors.success : colors.gray }
        ]}>
          <Text style={styles.statusText}>
            {vehicle.available ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Weight size={16} color={colors.gray} />
          <Text style={styles.detailText}>
            Max: {vehicle.maxWeight} kg
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Box size={16} color={colors.gray} />
          <Text style={styles.detailText}>
            Vol: {vehicle.maxVolume} m³
          </Text>
        </View>
      </View>
      
      <View style={styles.locationContainer}>
        <MapPin size={16} color={colors.primary} />
        <Text style={styles.locationText} numberOfLines={1}>
          {vehicle.currentLocation.address}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: colors.primary,
  },
  unavailableContainer: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  model: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  licensePlate: {
    fontSize: 14,
    color: colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 12,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
});