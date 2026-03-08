import de from './dictionaries/de.json';
import en from './dictionaries/en.json';
import es from './dictionaries/es.json';
import fr from './dictionaries/fr.json';

// Define explicit supported locales
export type Locale = 'de' | 'en' | 'es' | 'fr';

export const dictionaries = {
    de,
    en,
    es,
    fr
} as const;

// Helper Type for full type safety across all our keys
export type Dictionary = typeof de;

// Optional: Helper function for server-side usage
export const getDictionary = (locale: Locale | string): Dictionary => {
    if (['de', 'en', 'es', 'fr'].includes(locale)) {
        return dictionaries[locale as Locale];
    }
    return dictionaries.de; // Fallback
};
