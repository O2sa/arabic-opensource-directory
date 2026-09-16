import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, Direction } from '../types';

interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

export const translations: Translations = {
  siteTitle: {
    ar: 'دليل البرمجيات العربية مفتوحة المصدر',
    en: 'Arabic Open Source Directory',
  },
  siteSubtitle: {
    ar: 'الدليل الشامل والمحدث تلقائياً لأبرز المكتبات، النماذج، والأدوات البرمجية لخدمة اللغة العربية.',
    en: 'The automated living directory of open-source libraries, models, and tools for the Arabic language.',
  },
  submitProject: {
    ar: 'أضف مشروعاً',
    en: 'Submit Project',
  },
  searchPlaceholder: {
    ar: 'ابحث بالاسم، الوصف، التقنية، أو الكلمات الدلالية...',
    en: 'Search by title, description, stack, or keywords...',
  },
  allCategories: {
    ar: 'جميع التصنيفات',
    en: 'All Categories',
  },
  allLanguages: {
    ar: 'جميع لغات البرمجة',
    en: 'All Languages',
  },
  allStatuses: {
    ar: 'جميع الحالات',
    en: 'All Statuses',
  },
  statusActive: {
    ar: 'نشط حديثاً',
    en: 'Active',
  },
  statusMaintained: {
    ar: 'مُستقر',
    en: 'Maintained',
  },
  statusInactive: {
    ar: 'غير نشط',
    en: 'Inactive',
  },
  statusArchived: {
    ar: 'مؤرشف',
    en: 'Archived',
  },
  sortBy: {
    ar: 'ترتيب حسب',
    en: 'Sort By',
  },
  sortStars: {
    ar: 'الأعلى تقييماً (النجوم)',
    en: 'Most Stars',
  },
  sortUpdated: {
    ar: 'الأحدث نشاطاً',
    en: 'Recently Updated',
  },
  sortName: {
    ar: 'الاسم أبجدياً',
    en: 'Alphabetical',
  },
  statTotalProjects: {
    ar: 'مشروع مفتوح المصدر',
    en: 'Open Source Projects',
  },
  statTotalStars: {
    ar: 'إجمالي نجوم جيت هاب',
    en: 'Total GitHub Stars',
  },
  statActiveRate: {
    ar: 'نسبة المشاريع النشطة',
    en: 'Active Projects Rate',
  },
  statCategories: {
    ar: 'تصنيفات متخصصة',
    en: 'Specialized Categories',
  },
  noResultsTitle: {
    ar: 'لم نجد مشاريع مطابقة لبحثك',
    en: 'No matching projects found',
  },
  noResultsDesc: {
    ar: 'جرّب تعديل كلمات البحث أو تصفير الفلاتر المختارة.',
    en: 'Try adjusting your search terms or clearing your selected filters.',
  },
  resetFilters: {
    ar: 'تصفير الفلاتر',
    en: 'Reset Filters',
  },
  viewRepo: {
    ar: 'مستودع جيت هاب',
    en: 'GitHub Repo',
  },
  viewDocs: {
    ar: 'التوثيق / الموقع',
    en: 'Docs / Website',
  },
  lastCommit: {
    ar: 'آخر نشاط',
    en: 'Last activity',
  },
  release: {
    ar: 'الإصدار',
    en: 'Release',
  },
  license: {
    ar: 'الرخصة',
    en: 'License',
  },
  footerText: {
    ar: 'مبادرة مجتمعية لدعم وتمكين المنظومة التقنية للغة العربية. البيانات تُحدث دورياً عبر GitHub Actions.',
    en: 'A community initiative to empower the Arabic computational ecosystem. Data auto-synced via GitHub Actions.',
  },
  contributeBanner: {
    ar: 'هل تعرف مشروعاً عربياً رائعاً؟',
    en: 'Know an awesome Arabic project?',
  },
  contributeBannerDesc: {
    ar: 'ساهم بإضافته إلى الدليل عبر فتح طلب سحب (PR) أو إنشاء بلاغ.',
    en: 'Help grow the directory by opening a PR or submitting an issue.',
  }
};

interface LanguageContextType {
  lang: Locale;
  dir: Direction;
  setLang: (locale: Locale) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Locale>(() => {
    // 1. Read early attribute applied synchronously by anti-FOUC script in <head>
    if (typeof document !== 'undefined') {
      const existing = document.documentElement.lang as Locale;
      if (existing === 'ar' || existing === 'en') {
        return existing;
      }
    }

    // 2. Check localStorage for manual user preference
    try {
      const saved = localStorage.getItem('ar_dir_lang') as Locale;
      if (saved === 'ar' || saved === 'en') {
        return saved;
      }
    } catch {
      // Ignore
    }

    // 3. Detect user system language on first visit
    if (typeof navigator !== 'undefined') {
      const navLangs = navigator.languages || [navigator.language || ''];
      const prefersArabic = navLangs.some(l => l && l.toLowerCase().startsWith('ar'));
      return prefersArabic ? 'ar' : 'en';
    }

    return 'ar';
  });

  const dir: Direction = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = (newLang: Locale) => {
    setLangState(newLang);
    try {
      localStorage.setItem('ar_dir_lang', newLang);
    } catch {
      // Ignore
    }
  };

  const toggleLang = () => {
    setLangState(prev => {
      const next = prev === 'ar' ? 'en' : 'ar';
      try {
        localStorage.setItem('ar_dir_lang', next);
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const t = (key: string): string => {
    if (!translations[key]) {
      return key;
    }
    return translations[key][lang] || translations[key].en || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
