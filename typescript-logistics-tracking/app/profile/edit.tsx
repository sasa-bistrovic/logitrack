import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  MapPin, 
  Mail, 
  Phone,
  Camera,
  Check,
  Package,
  Truck
} from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { UserRole } from '@/types';
import Geolocation from '@react-native-community/geolocation';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser, isLoading } = useAuthStore();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [role, setRole] = useState<UserRole>(user?.role || 'orderer');

  function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation nije podržan."));
      }
  
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => reject(err)
      );
    });
  }

  async function reverseGeocode(lat: number, lon: number): Promise<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
  
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CargoConnect/1.0 (sasa.bistrovic@gmail.com)', // obavezno za Nominatim
      }
    });
  
    if (!response.ok) {
      throw new Error(`Greška: ${response.statusText}`);
    }
  
    const data = await response.json();
    return data.display_name || 'Adresa nije pronađena';
  }  
  
  const handleSave = async () => {
    Geolocation.getCurrentPosition(
      async (position) => {
        //setAddress(`Lokacija: ${position.coords.latitude}, ${position.coords.longitude}`);
        try {
          const myAddress = await reverseGeocode(position.coords.latitude, position.coords.longitude);
          setAddress(myAddress);
        } catch (err: any) {
          setAddress("Greška prilikom obrade adrese: " + err.message);
        }
      },
      (error) => {
        setAddress("Greška u geolokaciji:" + error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    //reverseGeocode((await getCurrentLocation()).lat, (await getCurrentLocation()).lng)
  //.then(adresa => setAddress('Adresa: ' + adresa)) 
  //.catch(err => setAddress(err));
    /*
    if (!user) return;
    
    try {
      await updateUser({
        name,
        email,
        phone,
        address,
        role,
      });

      //console.log((await getCurrentLocation()).lat+"_"+(await getCurrentLocation()).lng);
      
      Alert.alert(
        'Profile Updated',
        'Your profile has been updated successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
      */
  };
  
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.avatarContainer}>
          {user.avatar ? (
            <Image 
              source={{ uri: user.avatar }} 
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={40} color={colors.white} />
            </View>
          )}
          
          <TouchableOpacity style={styles.avatarEditButton}>
            <Camera size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <User size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Mail size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Phone size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <MapPin size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={address}
              onChangeText={setAddress}
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Type</Text>
          <Text style={styles.sectionSubtitle}>
            Select your role in the logistics process
          </Text>
          
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[
                styles.roleOption,
                role === 'orderer' && styles.roleOptionSelected
              ]}
              onPress={() => setRole('orderer')}
            >
              <View style={styles.roleHeader}>
                <View style={[
                  styles.roleIcon,
                  role === 'orderer' && styles.roleIconSelected
                ]}>
                  <Package size={24} color={role === 'orderer' ? colors.white : colors.primary} />
                </View>
                
                {role === 'orderer' && (
                  <View style={styles.checkIcon}>
                    <Check size={16} color={colors.white} />
                  </View>
                )}
              </View>
              
              <Text style={styles.roleTitle}>Transport Orderer</Text>
              <Text style={styles.roleDescription}>
                I want to ship goods and find transporters
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.roleOption,
                role === 'transporter' && styles.roleOptionSelected
              ]}
              onPress={() => setRole('transporter')}
            >
              <View style={styles.roleHeader}>
                <View style={[
                  styles.roleIcon,
                  role === 'transporter' && styles.roleIconSelected
                ]}>
                  <Truck size={24} color={role === 'transporter' ? colors.white : colors.primary} />
                </View>
                
                {role === 'transporter' && (
                  <View style={styles.checkIcon}>
                    <Check size={16} color={colors.white} />
                  </View>
                )}
              </View>
              
              <Text style={styles.roleTitle}>Transporter</Text>
              <Text style={styles.roleDescription}>
                I have vehicles and want to transport goods
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button 
          title="Save Changes" 
          onPress={handleSave}
          isLoading={isLoading}
          style={styles.button}
        />
      </View>
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
  scrollView: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    height: 48,
    color: colors.text,
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  roleOption: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleOptionSelected: {
    borderColor: colors.primary,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconSelected: {
    backgroundColor: colors.primary,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 12,
    color: colors.textLight,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    width: '100%',
  },
});