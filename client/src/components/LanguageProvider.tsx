import { createContext, useContext, useState } from "react";

type Language = "cs" | "en";

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

interface LanguageProviderState {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageProviderContext = createContext<LanguageProviderState | undefined>(undefined);

export function LanguageProvider({ children, defaultLanguage = "cs" }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem("webaudit_lang");
    return (stored as Language) || defaultLanguage;
  });

  const value = {
    language,
    setLanguage: (language: Language) => {
      setLanguage(language);
      localStorage.setItem("webaudit_lang", language);
    },
  };

  return (
    <LanguageProviderContext.Provider value={value}>
      {children}
    </LanguageProviderContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
