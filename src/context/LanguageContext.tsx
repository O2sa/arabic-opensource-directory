import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Locale, Direction } from '../types';
import { SITE_CONFIG } from '../config/site';

export function getLangFromPath(): Locale | null {
  if (typeof window === 'undefined') return null;
  const segments = window.location.pathname.split('/').filter(Boolean);
  for (const seg of segments) {
    const lower = seg.toLowerCase();
    if (lower === 'ar') return 'ar';
    if (lower === 'en') return 'en';
  }
  return null;
}

export function updatePathWithLang(newLang: Locale, replace = false) {
  if (typeof window === 'undefined') return;
  const pathname = window.location.pathname;
  const segments = pathname.split('/').filter(Boolean);
  const langIndex = segments.findIndex(s => s.toLowerCase() === 'ar' || s.toLowerCase() === 'en');

  if (langIndex !== -1) {
    segments[langIndex] = newLang;
  } else {
    // Append /ar or /en
    segments.push(newLang);
  }

  const newPath = '/' + segments.join('/') + window.location.search + window.location.hash;
  if (newPath !== pathname + window.location.search + window.location.hash) {
    if (replace) {
      window.history.replaceState({ lang: newLang }, '', newPath);
    } else {
      window.history.pushState({ lang: newLang }, '', newPath);
    }
  }
}

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
  categoriesSelected: {
    ar: 'تصنيفات محددة',
    en: 'categories selected',
  },
  clearCategories: {
    ar: 'إلغاء التحديد',
    en: 'Clear selection',
  },
  loadMore: {
    ar: 'عرض المزيد من المشاريع',
    en: 'Load More Projects',
  },
  showAllProjects: {
    ar: 'عرض الكل',
    en: 'Show All',
  },
  showingProjectsProgress: {
    ar: 'تم عرض {count} من أصل {total} مشروع',
    en: 'Showing {count} of {total} projects',
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
    ar: 'ساهم باقتراحه بسهولة عبر نموذج التذاكر (GitHub Issues) لتتم معالجته وتدقيقه آلياً.',
    en: 'Propose it easily via GitHub Issues form for automated verification and inclusion.',
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
    // 1. Highest priority: explicit URL route (/ar or /en)
    const urlLang = getLangFromPath();
    if (urlLang) {
      return urlLang;
    }

    // 2. Read early attribute applied synchronously by anti-FOUC script in <head>
    if (typeof document !== 'undefined') {
      const existing = document.documentElement.lang as Locale;
      if (existing === 'ar' || existing === 'en') {
        return existing;
      }
    }

    // 3. Check localStorage for manual user preference
    try {
      const saved = localStorage.getItem('ar_dir_lang') as Locale;
      if (saved === 'ar' || saved === 'en') {
        return saved;
      }
    } catch {
      // Ignore
    }

    // 4. Detect user system language on first visit
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

    // Update canonical link in DOM
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${SITE_CONFIG.siteUrl}/${lang}`);

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', SITE_CONFIG.description[lang]);
    }

    // Ensure URL has language route
    const currentUrlLang = getLangFromPath();
    if (currentUrlLang !== lang) {
      updatePathWithLang(lang, true);
    }
  }, [lang, dir]);

  // Handle browser back and forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const urlLang = getLangFromPath();
      if (urlLang && urlLang !== lang) {
        setLangState(urlLang);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [lang]);

  const setLang = useCallback((newLang: Locale) => {
    setLangState(newLang);
    updatePathWithLang(newLang, false);
    try {
      localStorage.setItem('ar_dir_lang', newLang);
    } catch {
      // Ignore
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState(prev => {
      const next = prev === 'ar' ? 'en' : 'ar';
      updatePathWithLang(next, false);
      try {
        localStorage.setItem('ar_dir_lang', next);
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

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
