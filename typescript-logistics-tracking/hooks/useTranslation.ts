import { useEffect, useState } from 'react';
import { useLanguageStore } from '@/store/languageStore';

export function useTranslation() {
  const { selectedLanguage, translateText, translateBatch, isTranslating } = useLanguageStore();

  const t = async (text: string): Promise<string> => {
    if (selectedLanguage === 'en') return text;
    return await translateText(text);
  };

  const tBatch = async (texts: string[]): Promise<Record<string, string>> => {
    if (selectedLanguage === 'en') {
      return texts.reduce((acc, text) => ({ ...acc, [text]: text }), {});
    }
    return await translateBatch(texts);
  };

  return {
    t,
    tBatch,
    selectedLanguage,
    isTranslating
  };
}

export function useTranslatedText(text: string): string {
  const { selectedLanguage, translateText } = useLanguageStore();
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    if (selectedLanguage === 'en') {
      setTranslatedText(text);
      return;
    }

    let isMounted = true;

    const translate = async () => {
      try {
        const result = await translateText(text);
        if (isMounted) {
          setTranslatedText(result);
        }
      } catch (error) {
        console.error('Translation error:', error);
        if (isMounted) {
          setTranslatedText(text);
        }
      }
    };

    translate();

    return () => {
      isMounted = false;
    };
  }, [text, selectedLanguage, translateText]);

  return translatedText;
}

export function useTranslatedTexts(texts: string[]): Record<string, string> {
  const { selectedLanguage, translateBatch } = useLanguageStore();
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>(
    texts.reduce((acc, text) => ({ ...acc, [text]: text }), {})
  );

  useEffect(() => {
    if (selectedLanguage === 'en') {
      setTranslatedTexts(texts.reduce((acc, text) => ({ ...acc, [text]: text }), {}));
      return;
    }

    let isMounted = true;

    const translate = async () => {
      try {
        const results = await translateBatch(texts);
        if (isMounted) {
          setTranslatedTexts(results);
        }
      } catch (error) {
        console.error('Batch translation error:', error);
        if (isMounted) {
          setTranslatedTexts(texts.reduce((acc, text) => ({ ...acc, [text]: text }), {}));
        }
      }
    };

    translate();

    return () => {
      isMounted = false;
    };
  }, [texts, selectedLanguage, translateBatch]);

  return translatedTexts;
}