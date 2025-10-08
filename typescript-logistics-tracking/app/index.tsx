import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { Truck } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import Head from "expo-router/head";

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();  

  const handleGetStarted = async () => {
    await logout();
    router.push('/auth/login');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === 'web' && (
    <>
      <Head>
        <title>LogiTrack - Efficient Logistics Management Platform</title>
        <meta
          name="description"
          content="LogiTrack connects transporters with businesses for seamless shipping. Track shipments in real time, manage logistics, and optimize your supply chain easily."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, height=device-height, viewport-fit=cover"
        />
        <link rel="icon" href="https://expensetrackinghub.expense-tracking.com/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="https://expensetrackinghub.expense-tracking.com/favicon.ico" type="image/x-icon" />

        <link rel="canonical" href="https://expensetrackinghub.expense-tracking.com" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="LogiTrack" />
        <meta property="og:title" content="LogiTrack - Efficient Logistics Management Platform" />
        <meta
          property="og:description"
          content="LogiTrack connects transporters with businesses for seamless shipping. Track shipments in real time, manage logistics, and optimize your supply chain easily."
        />
        <meta name="twitter:title" content="LogiTrack - Efficient Logistics Management Platform" />
        <meta
          name="twitter:description"
          content="LogiTrack connects transporters with businesses for seamless shipping. Track shipments in real time, manage logistics, and optimize your supply chain easily."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "LogiTrack",
              "url": "https://expensetrackinghub.expense-tracking.com",
              "description":
                "LogiTrack connects transporters with businesses for seamless shipping. Track shipments in real time, manage logistics, and optimize your supply chain easily.",
            }),
          }}
        />
      </Head>
    </>
      )}
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.iconContainer}>
            <Truck size={60} color={colors.white} />
          </View>
          <h1 style={styles.appName}>LogiTrack</h1>
        </View>
        
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=800&auto=format&fit=crop' }} 
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Efficient Logistics Management</Text>
          <Text style={styles.subtitle}>
            Connect with transporters, track shipments in real-time, and manage your logistics operations seamlessly.
          </Text>
        </View>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
              <Truck size={24} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>Order Transport</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.secondaryLight }]}>
              <Truck size={24} color={colors.secondary} />
            </View>
            <Text style={styles.featureText}>Track Shipments</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
              <Truck size={24} color={colors.primary} />
            </View>
            <Text style={styles.featureText}>Manage Profile</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Button 
          title="Get Started" 
          size="large"
          onPress={handleGetStarted}
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
  content: {
    flex: 1,
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    width: '100%',
  },
});