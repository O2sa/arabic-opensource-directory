import { useState, useMemo, useEffect } from 'react';
import {
  Category,
  EnrichedProject,
  FilterState,
  SortOption,
  EcosystemStats,
} from '../types';

// Bundled fallbacks for resilience
import fallbackCategories from '../../data/categories.json';
import fallbackProjects from '../../data/projects-enriched.json';

// Utility to normalize Arabic characters (removes diacritics and unifies Alef/Yaa/Taa Marbuta)
function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    // Remove Tashkeel (diacritics)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Unify Alef forms
    .replace(/[إأآٱ]/g, 'ا')
    // Unify Yaa and Alef Maksura
    .replace(/ى/g, 'ي')
    // Unify Taa Marbuta
    .replace(/ة/g, 'ه')
    .toLowerCase()
    .trim();
}

export function useProjects(locale: 'ar' | 'en' = 'ar') {
  const [categories] = useState<Category[]>(fallbackCategories as Category[]);
  const [allProjects, setAllProjects] = useState<EnrichedProject[]>(fallbackProjects as EnrichedProject[]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & search states
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categories: [],
    category: 'all',
    language: 'all',
    status: 'all',
    sortBy: 'stars',
  });

  // Try fetching fresh data on mount (supports dynamic runtime updates in dev or production)
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await fetch('./data/projects-enriched.json');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setAllProjects(data);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Using fallback dataset');
        }
        console.info('Using bundled static dataset fallback.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute available programming languages
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    allProjects.forEach(p => {
      if (p.github?.primaryLanguage) {
        langs.add(p.github.primaryLanguage);
      }
    });
    return Array.from(langs).sort();
  }, [allProjects]);

  // Compute ecosystem statistics across all projects
  const stats: EcosystemStats = useMemo(() => {
    const totalProjects = allProjects.length;
    let totalStars = 0;
    let activeOrMaintained = 0;
    const activeCats = new Set<string>();

    allProjects.forEach(p => {
      totalStars += p.github?.stars || 0;
      if (p.activityStatus === 'active' || p.activityStatus === 'maintained') {
        activeOrMaintained++;
      }
      activeCats.add(p.category);
    });

    return {
      totalProjects,
      totalStars,
      activePercentage: totalProjects > 0 ? Math.round((activeOrMaintained / totalProjects) * 100) : 0,
      categoryCount: activeCats.size,
    };
  }, [allProjects]);

  // Project count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allProjects.length };
    allProjects.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [allProjects]);

  // Filtered and sorted projects
  const filteredProjects = useMemo(() => {
    const query = normalizeArabic(filters.search);

    return allProjects
      .filter(project => {
        // 1. Category filter (UNION / OR logic across all selected categories)
        const activeCategories = filters.categories && filters.categories.length > 0
          ? filters.categories
          : (filters.category && filters.category !== 'all' ? [filters.category] : []);

        if (activeCategories.length > 0 && !activeCategories.includes(project.category)) {
          return false;
        }

        // 2. Programming language filter
        if (filters.language !== 'all' && project.github?.primaryLanguage !== filters.language) {
          return false;
        }

        // 3. Status filter
        if (filters.status !== 'all' && project.activityStatus !== filters.status) {
          return false;
        }

        // 4. Search query filter
        if (query) {
          const matchTitleAr = normalizeArabic(project.title.ar).includes(query);
          const matchTitleEn = normalizeArabic(project.title.en).includes(query);
          const matchDescAr = normalizeArabic(project.description.ar).includes(query);
          const matchDescEn = normalizeArabic(project.description.en).includes(query);
          const matchRepo = project.repo.toLowerCase().includes(query);
          const matchTags = project.tags.some(tag => normalizeArabic(tag).includes(query));

          if (!matchTitleAr && !matchTitleEn && !matchDescAr && !matchDescEn && !matchRepo && !matchTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'stars') {
          return (b.github?.stars || 0) - (a.github?.stars || 0);
        }
        if (filters.sortBy === 'updated') {
          const dateA = a.github?.lastCommitAt ? new Date(a.github.lastCommitAt).getTime() : 0;
          const dateB = b.github?.lastCommitAt ? new Date(b.github.lastCommitAt).getTime() : 0;
          return dateB - dateA;
        }
        if (filters.sortBy === 'name') {
          const titleA = (a.title[locale] || a.title.en).toLowerCase();
          const titleB = (b.title[locale] || b.title.en).toLowerCase();
          return titleA.localeCompare(titleB, locale === 'ar' ? 'ar' : 'en');
        }
        return 0;
      });
  }, [allProjects, filters, locale]);

  // Filter mutators
  const setSearch = (search: string) => setFilters(prev => ({ ...prev, search }));

  const toggleCategory = (categoryId: string) => {
    if (categoryId === 'all') {
      setFilters(prev => ({ ...prev, categories: [], category: 'all' }));
      return;
    }

    setFilters(prev => {
      const currentCats = prev.categories || (prev.category && prev.category !== 'all' ? [prev.category] : []);
      const exists = currentCats.includes(categoryId);
      const updated = exists
        ? currentCats.filter(id => id !== categoryId)
        : [...currentCats, categoryId];

      return {
        ...prev,
        categories: updated,
        category: updated.length === 1 ? updated[0] : (updated.length === 0 ? 'all' : updated.join(',')),
      };
    });
  };

  const setCategories = (categories: string[]) => {
    setFilters(prev => ({
      ...prev,
      categories,
      category: categories.length === 1 ? categories[0] : (categories.length === 0 ? 'all' : categories.join(',')),
    }));
  };

  const setCategory = (category: string) => {
    if (category === 'all' || !category) {
      setFilters(prev => ({ ...prev, categories: [], category: 'all' }));
    } else {
      setFilters(prev => ({ ...prev, categories: [category], category }));
    }
  };

  const setLanguage = (language: string) => setFilters(prev => ({ ...prev, language }));
  const setStatus = (status: FilterState['status']) => setFilters(prev => ({ ...prev, status }));
  const setSortBy = (sortBy: SortOption) => setFilters(prev => ({ ...prev, sortBy }));

  const resetFilters = () => {
    setFilters({
      search: '',
      categories: [],
      category: 'all',
      language: 'all',
      status: 'all',
      sortBy: 'stars',
    });
  };

  return {
    categories,
    allProjects,
    projects: filteredProjects,
    isLoading,
    error,
    filters,
    stats,
    categoryCounts,
    availableLanguages,
    setSearch,
    setCategory,
    setCategories,
    toggleCategory,
    setLanguage,
    setStatus,
    setSortBy,
    resetFilters,
  };
}
