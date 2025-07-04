export const translations = {
  cs: {
    // Header
    appTitle: "WebAudit Pro",
    
    // Language toggle
    languageCs: "🇨🇿 CS",
    languageEn: "🇬🇧 EN",
    
    // Hero section
    heroTitle: "Profesionální analýza vašeho webu",
    heroSubtitle: "Získejte detailní audit čitelnosti a připravenosti pro AI za pouhých 50 Kč",
    
    // Form
    urlLabel: "URL adresa webu",
    urlPlaceholder: "https://example.com",
    emailLabel: "E-mailová adresa",
    emailPlaceholder: "vas@email.com",
    startAnalysisButton: "Spustit analýzu",
    
    // Loading
    analyzingTitle: "Analyzujeme váš web...",
    analyzingSubtitle: "Procházíme všechny stránky webu a analyzujeme 9 oblastí. Může to trvat 1-2 minuty.",
    
    // Results
    resultsTitle: "Výsledky analýzy",
    totalScoreLabel: "% celkové skóre",
    
    // Analysis areas
    htmlStructure: "Struktura HTML",
    metadata: "Metadata",
    schema: "Schema.org",
    contentWithoutJs: "Obsah bez JS",
    sitemapRobots: "Sitemap & Robots",
    accessibility: "Přístupnost",
    speed: "Rychlost",
    readability: "Čitelnost",
    internalLinking: "Prolinkování",
    
    // Payment
    completeOrderTitle: "Dokončit objednávku",
    completeOrderSubtitle: "Pro získání kompletních výsledků a PDF reportu zaplaťte 50 Kč",
    termsLabel: "Souhlasím s ",
    termsLink: "obchodními podmínkami",
    privacyLabel: "Souhlasím se ",
    privacyLink: "zásadami ochrany osobních údajů",
    dataLabel: "Souhlasím se ",
    dataLink: "zpracováním a sdílením dat",
    payButton: "Zaplatit 50 Kč",
    
    // Success
    successTitle: "Platba úspěšně dokončena!",
    successSubtitle: "PDF report byl odeslán na váš e-mail a můžete si ho také stáhnout níže.",
    downloadPdfButton: "Stáhnout PDF",
    newAnalysisButton: "Nová analýza",
    
    // Legal documents
    termsTitle: "Obchodní podmínky",
    privacyTitle: "Ochrana osobních údajů",
    dataTitle: "Zpracování a sdílení dat",
    
    // Footer
    footerText: "© 2024 WebAudit Pro. Všechna práva vyhrazena.",
    
    // Errors
    invalidUrl: "Zadejte platnou URL adresu",
    invalidEmail: "Zadejte platnou e-mailovou adresu",
    analysisError: "Analýza se nezdařila. Zkuste to prosím znovu.",
    paymentError: "Platba se nezdařila. Zkuste to prosím znovu.",
    allConsentsRequired: "Musíte souhlasit se všemi podmínkami",
  },
  en: {
    // Header
    appTitle: "WebAudit Pro",
    
    // Language toggle
    languageCs: "🇨🇿 CS",
    languageEn: "🇬🇧 EN",
    
    // Hero section
    heroTitle: "Professional Website Analysis",
    heroSubtitle: "Get detailed readability and AI-readiness audit for just 50 CZK",
    
    // Form
    urlLabel: "Website URL",
    urlPlaceholder: "https://example.com",
    emailLabel: "Email Address",
    emailPlaceholder: "your@email.com",
    startAnalysisButton: "Start Analysis",
    
    // Loading
    analyzingTitle: "Analyzing your website...",
    analyzingSubtitle: "We're crawling all pages and analyzing 9 areas. This may take 1-2 minutes.",
    
    // Results
    resultsTitle: "Analysis Results",
    totalScoreLabel: "% total score",
    
    // Analysis areas
    htmlStructure: "HTML Structure",
    metadata: "Metadata",
    schema: "Schema.org",
    contentWithoutJs: "Content without JS",
    sitemapRobots: "Sitemap & Robots",
    accessibility: "Accessibility",
    speed: "Speed",
    readability: "Readability",
    internalLinking: "Internal Linking",
    
    // Payment
    completeOrderTitle: "Complete Order",
    completeOrderSubtitle: "To get complete results and PDF report, pay 50 CZK",
    termsLabel: "I agree to the ",
    termsLink: "terms and conditions",
    privacyLabel: "I agree to the ",
    privacyLink: "privacy policy",
    dataLabel: "I agree to ",
    dataLink: "data processing and sharing",
    payButton: "Pay 50 CZK",
    
    // Success
    successTitle: "Payment Successfully Completed!",
    successSubtitle: "PDF report has been sent to your email and you can also download it below.",
    downloadPdfButton: "Download PDF",
    newAnalysisButton: "New Analysis",
    
    // Legal documents
    termsTitle: "Terms and Conditions",
    privacyTitle: "Privacy Policy",
    dataTitle: "Data Processing and Sharing",
    
    // Footer
    footerText: "© 2024 WebAudit Pro. All rights reserved.",
    
    // Errors
    invalidUrl: "Please enter a valid URL",
    invalidEmail: "Please enter a valid email address",
    analysisError: "Analysis failed. Please try again.",
    paymentError: "Payment failed. Please try again.",
    allConsentsRequired: "You must agree to all terms and conditions",
  },
} as const;

export type TranslationKey = keyof typeof translations.cs;
