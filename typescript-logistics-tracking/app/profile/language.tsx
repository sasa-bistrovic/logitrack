import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Globe, Loader, Eye } from 'lucide-react-native';
import { languages, getLanguageByCode } from '@/constants/languages';
import { useLanguageStore } from '@/store/languageStore';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';

export default function LanguageScreen() {
  const router = useRouter();
  const { selectedLanguage, setLanguage, isTranslating} = useLanguageStore();
  const [tempSelectedLanguage, setTempSelectedLanguage] = useState(selectedLanguage);

  const handleLanguageSelect = (languageCode: string) => {
    setTempSelectedLanguage(languageCode);
  };

  const handleSave = () => {
    setLanguage('en');
    if (tempSelectedLanguage !== selectedLanguage) {
      Alert.alert(
        'Change Language',
        `Switch to ${getLanguageByCode(tempSelectedLanguage)?.nativeName}? The app will translate text content to the selected language.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Change',
            onPress: () => {
              setLanguage('en');
              router.back();
            }
          }
        ]
      );
    } else {
      router.back();
    }
  };

  const testTranslation = async () => {
    if (tempSelectedLanguage === 'en') {
      Alert.alert('Test Translation', 'English is the default language, no translation needed.');
      return;
    }

    const { translateText } = useLanguageStore.getState();
    
    try {
      const testText = 'Hello! This is a test translation to verify the language system is working correctly.';
      const translated = await translateText(testText, tempSelectedLanguage);
      
      Alert.alert(
        'Translation Test',
        `Original: ${testText}\n\nTranslated: ${translated}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Translation Error', 'Failed to test translation. Please check your internet connection.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Globe size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Select Language</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Choose your preferred language. The app will translate text content to the selected language using AI translation.
          </Text>
        </View>

        <View style={styles.languageList}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageItem,
                tempSelectedLanguage === language.code && styles.selectedLanguageItem
              ]}
              onPress={() => handleLanguageSelect(language.code)}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.languageFlag}>{language.flag}</Text>
                <View style={styles.languageText}>
                  <Text style={styles.languageName}>{language.name}</Text>
                  <Text style={styles.languageNativeName}>{language.nativeName}</Text>
                </View>
              </View>
              {tempSelectedLanguage === language.code && (
                <Check size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.testSection}>
          <View style={styles.buttonRow}>
            <Button
              title="Test Translation"
              variant="outline"
              onPress={testTranslation}
              disabled={isTranslating}
              leftIcon={isTranslating ? <Loader size={16} color={colors.primary} /> : undefined}
              style={[styles.testButton, styles.halfButton]}
            />
            <Button
              title="View Demo"
              variant="outline"
              onPress={() => router.push('/profile/translation-demo')}
              leftIcon={<Eye size={16} color={colors.primary} />}
              style={[styles.testButton, styles.halfButton]}
            />
          </View>
          <Text style={styles.testDescription}>
            Test the translation system or view a comprehensive demo of how translations work in the app.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How Translation Works</Text>
          <Text style={styles.infoText}>
            • Text content is translated using AI-powered translation{'\n'}
            • Translations are cached for better performance{'\n'}
            • Original English text is shown if translation fails{'\n'}
            • Internet connection required for new translations{'\n'}
            • Croatian and other major languages are supported
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Changes"
          onPress={handleSave}
          disabled={isTranslating}
          style={styles.saveButton}
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
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  languageList: {
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedLanguageItem: {
    backgroundColor: colors.primaryLight,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  languageNativeName: {
    fontSize: 14,
    color: colors.textLight,
  },
  testSection: {
    padding: 20,
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  testButton: {
    marginBottom: 0,
  },
  halfButton: {
    flex: 1,
  },
  testDescription: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoSection: {
    padding: 20,
    backgroundColor: colors.white,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    width: '100%',
  },
});