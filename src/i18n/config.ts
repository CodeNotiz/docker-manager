import de from "./dictionaries/de.json";
import en from "./dictionaries/en.json";
import es from "./dictionaries/es.json";
import fr from "./dictionaries/fr.json";
import uk from "./dictionaries/uk.json";
import ja from "./dictionaries/ja.json";
import zh from "./dictionaries/zh.json";
import ru from "./dictionaries/ru.json";

// Define explicit supported locales
export type Locale = "de" | "en" | "es" | "fr" | "uk" | "ja" | "zh" | "ru";

export const dictionaries = {
  de,
  en,
  es,
  fr,
  uk,
  ja,
  zh,
  ru,
} as const;

// Helper Type for full type safety across all our keys
export type Dictionary = typeof de;

// Optional: Helper function for server-side usage
export const getDictionary = (locale: Locale | string): Dictionary => {
  if (["de", "en", "es", "fr", "uk", "ja", "zh", "ru"].includes(locale)) {
    return dictionaries[locale as Locale];
  }
  return dictionaries.de; // Fallback
};
