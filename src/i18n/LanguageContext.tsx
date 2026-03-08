"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Locale, Dictionary, getDictionary } from "./config";
import { useRouter } from "next/navigation";

interface LanguageContextProps {
    locale: Locale;
    t: Dictionary;
    setLanguage: (newLocale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({
    children,
    initialLocale
}: {
    children: React.ReactNode;
    initialLocale: Locale;
}) {
    const [locale, setLocale] = useState<Locale>(initialLocale);
    const router = useRouter();

    // Create dictionary instance
    const t = getDictionary(locale);

    const setLanguage = (newLocale: Locale) => {
        // Save to Cookie (used by server components) valid for 365 days
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
        setLocale(newLocale);
        router.refresh(); // Refresh page to re-render server components with new cookie
    };

    return (
        <LanguageContext.Provider value={{ locale, t, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
