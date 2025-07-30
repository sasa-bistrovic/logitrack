import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';
import { TranslatedText } from '@/components/TranslatedText';
import { useTranslatedTexts } from '@/hooks/useTranslation';
import { useLanguageStore } from '@/store/languageStore';
import { getLanguageByCode } from '@/constants/languages';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';

const demoTexts = [
  'Welcome to LogiTrack',
  'Track your shipments in real-time',
  'Manage your logistics operations',
  'Connect with reliable transporters',
  'Optimize your supply chain',
  'Order Status: In Transit',
  'Pickup Location',
  'Delivery Address',
  'Estimated Arrival Time',
  'Driver Information',
  'Vehicle Details',
  'Package Weight: 25 kg',
  'Delivery Instructions',
  'Contact Support',
  'Rate this service'
];

export default function TranslationDemoScreen() {
  const router = useRouter();
  const { selectedLanguage, isTranslating, translateText } = useLanguageStore();
  const [refreshKey, setRefreshKey] = useState(0);
  
  const translatedTexts = useTranslatedTexts(demoTexts.map(text => `${text}_${refreshKey}`));
  
  const currentLanguage = getLanguageByCode(selectedLanguage);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const [description, setDescription] = useState("These texts show how the app interface would appear in your selected language:");

useEffect(() => {
  const translate = async () => {
    const result = await translateText("These texts show how the app interface would appear in your selected language:", "hr");
    setDescription(result);
  };
  translate();
}, []);  

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Translation Demo</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <RefreshCw size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Current Language</Text>
          <View style={styles.languageInfo}>
            <Text style={styles.languageFlag}>{currentLanguage?.flag}</Text>
            <View>
              <Text style={styles.languageName}>{currentLanguage?.name}</Text>
              <Text style={styles.languageNative}>{currentLanguage?.nativeName}</Text>
            </View>
          </View>
          {isTranslating && (
            <Text style={styles.translatingText}>Translating content...</Text>
          )}
        </View>

        <View style={styles.demoSection}>
          <Text style={styles.sectionTitle}>App Interface Examples</Text>
          <Text style={styles.sectionDescription}>
            {description}
          </Text>

          <View style={styles.demoGrid}>
            {demoTexts.map((text, index) => (
              <View key={index} style={styles.demoItem}>
                <View style={styles.originalText}>
                  <Text style={styles.originalLabel}>Original (EN):</Text>
                  <Text style={styles.originalValue}>{text}</Text>
                </View>
                <View style={styles.translatedText}>
                  <Text style={styles.translatedLabel}>
                    Translated ({selectedLanguage.toUpperCase()}):
                  </Text>
                  <Text style={styles.translatedValue}>
                    {translatedTexts[`${text}_${refreshKey}`] || text}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.componentDemo}>
          <Text style={styles.sectionTitle}>Live Translation Component</Text>
          <Text style={styles.sectionDescription}>
            Using the TranslatedText component:
          </Text>
          
          <View style={styles.componentExample}>
            <TranslatedText 
              text="This text is automatically translated using the TranslatedText component!"
              style={styles.componentText}
            />
          </View>
        </View>

        <View style={styles.instructionsSection}>
          <Text style={styles.sectionTitle}>How to Use Translation</Text>
          <Text style={styles.instructionText}>
            1. Import the translation hooks:{'\n'}
            <Text style={styles.codeText}>
              import {'{ useTranslatedText }'} from '@/hooks/useTranslation';
            </Text>
            {'\n\n'}
            2. Use in your component:{'\n'}
            <Text style={styles.codeText}>
              const translatedText = useTranslatedText('Hello World');
            </Text>
            {'\n\n'}
            3. Or use the TranslatedText component:{'\n'}
            <Text style={styles.codeText}>
              {'<TranslatedText text="Hello World" style={styles.text} />'}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  refreshButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  infoSection: {
    padding: 20,
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageFlag: {
    fontSize: 32,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
  },
  languageNative: {
    fontSize: 14,
    color: colors.textLight,
  },
  translatingText: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  demoSection: {
    padding: 20,
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
    lineHeight: 20,
  },
  demoGrid: {
    gap: 16,
  },
  demoItem: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  originalText: {
    marginBottom: 8,
  },
  originalLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
    marginBottom: 4,
  },
  originalValue: {
    fontSize: 14,
    color: colors.text,
  },
  translatedText: {},
  translatedLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  translatedValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  componentDemo: {
    padding: 20,
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  componentExample: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  componentText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  instructionsSection: {
    padding: 20,
    backgroundColor: colors.white,
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  codeText: {
    fontFamily: 'monospace',
    backgroundColor: colors.background,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    color: colors.primary,
  },
});