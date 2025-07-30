import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTranslatedText } from '@/hooks/useTranslation';

interface TranslatedTextProps extends TextProps {
  text: string;
  fallback?: string;
}

export function TranslatedText({ text, fallback, ...props }: TranslatedTextProps) {
  const translatedText = useTranslatedText(text);
  
  return (
    <Text {...props}>
      {translatedText || fallback || text}
    </Text>
  );
}