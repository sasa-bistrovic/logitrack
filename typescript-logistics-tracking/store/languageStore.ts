import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageState {
  selectedLanguage: string;
  translations: Record<string, Record<string, string>>;
  isTranslating: boolean;
  setLanguage: (language: string) => void;
  translateText: (text: string, targetLanguage?: string) => Promise<string>;
  translateBatch: (texts: string[], targetLanguage?: string) => Promise<Record<string, string>>;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      selectedLanguage: 'en',
      translations: {},
      isTranslating: false,

      setLanguage: (language: string) => {
        set({ selectedLanguage: language });
      },

      translateText: async (text: string, targetLanguage?: string): Promise<string> => {
        const { selectedLanguage, translations } = get();
        const target = targetLanguage || selectedLanguage;
        
        if (target === 'en' || !text.trim()) {
          return text;
        }

        const cacheKey = `${text}_${target}`;
        if (translations[cacheKey]) {
          return translations[cacheKey];
        }

        set({ isTranslating: true });

        try {
          const response = await fetch('https://toolkit.rork.com/text/llm/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [
                {
                  role: 'system',
                  content: `You are a professional translator. Translate the given text to ${target === 'hr' ? 'Croatian' : target}. Only return the translated text, nothing else. Preserve any formatting, punctuation, and maintain the same tone and context.`
                },
                {
                  role: 'user',
                  content: text
                }
              ]
            })
          });

          if (!response.ok) {
            throw new Error('Translation failed');
          }

          const data = await response.json();
          const translatedText = data.completion.trim();

          set(state => ({
            translations: {
              ...state.translations,
              [cacheKey]: translatedText
            },
            isTranslating: false
          }));

          return translatedText;
        } catch (error) {
          console.error('Translation error:', error);
          set({ isTranslating: false });
          return text; // Return original text on error
        }
      },

      translateBatch: async (texts: string[], targetLanguage?: string): Promise<Record<string, string>> => {
        const { selectedLanguage, translations } = get();
        const target = targetLanguage || selectedLanguage;
        
        if (target === 'en') {
          return texts.reduce((acc, text) => ({ ...acc, [text]: text }), {});
        }

        const results: Record<string, string> = {};
        const textsToTranslate: string[] = [];

        // Check cache first
        texts.forEach(text => {
          const cacheKey = `${text}_${target}`;
          if (translations[cacheKey]) {
            results[text] = translations[cacheKey];
          } else if (text.trim()) {
            textsToTranslate.push(text);
          } else {
            results[text] = text;
          }
        });

        if (textsToTranslate.length === 0) {
          return results;
        }

        set({ isTranslating: true });

        try {
          const batchText = textsToTranslate.join('\n---SEPARATOR---\n');
          
          const response = await fetch('https://toolkit.rork.com/text/llm/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [
                {
                  role: 'system',
                  content: `You are a professional translator. Translate each text segment separated by "---SEPARATOR---" to ${target === 'hr' ? 'Croatian' : target}. Return the translations in the same order, separated by "---SEPARATOR---". Only return the translated texts, nothing else.`
                },
                {
                  role: 'user',
                  content: batchText
                }
              ]
            })
          });

          if (!response.ok) {
            throw new Error('Batch translation failed');
          }

          const data = await response.json();
          const translatedTexts = data.completion.split('---SEPARATOR---');

          const newTranslations: Record<string, string> = {};
          
          textsToTranslate.forEach((originalText, index) => {
            const translatedText = translatedTexts[index]?.trim() || originalText;
            results[originalText] = translatedText;
            newTranslations[`${originalText}_${target}`] = translatedText;
          });

          set(state => ({
            translations: {
              ...state.translations,
              ...newTranslations
            },
            isTranslating: false
          }));

          return results;
        } catch (error) {
          console.error('Batch translation error:', error);
          set({ isTranslating: false });
          
          // Return original texts on error
          textsToTranslate.forEach(text => {
            results[text] = text;
          });
          
          return results;
        }
      }
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedLanguage: state.selectedLanguage,
        translations: state.translations
      })
    }
  )
);