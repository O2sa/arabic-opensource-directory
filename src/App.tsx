import React from 'react';
import { useLanguage } from './context/LanguageContext';
import { useProjects } from './hooks/useProjects';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SearchAndFilters } from './components/SearchAndFilters';
import { ProjectGrid } from './components/ProjectGrid';
import { Footer } from './components/Footer';
import { SITE_CONFIG } from './config/site';

export const App: React.FC = () => {
  const { lang } = useLanguage();
  const {
    categories,
    projects,
    isLoading,
    filters,
    stats,
    categoryCounts,
    availableLanguages,
    setSearch,
    setCategory,
    toggleCategory,
    setLanguage,
    setStatus,
    setSortBy,
    resetFilters,
  } = useProjects(lang);

  React.useEffect(() => {
    document.title = lang === 'ar'
      ? 'دليل المصادر المفتوحة للغة العربية | Arabic Open Source Directory'
      : 'Arabic Open Source Directory | دليل المصادر المفتوحة للغة العربية';
  }, [lang]);

  return (
    <div id="top" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Navbar repoUrl={SITE_CONFIG.repoUrl} />

      <main style={{ flex: 1, width: '100%', maxWidth: '100%' }}>
        <Hero stats={stats} repoUrl={SITE_CONFIG.repoUrl} />

        <section className="container projects-container" style={{ paddingBottom: '3.5rem' }}>
          <SearchAndFilters
            categories={categories}
            filters={filters}
            categoryCounts={categoryCounts}
            availableLanguages={availableLanguages}
            totalFiltered={projects.length}
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
            onToggleCategory={toggleCategory}
            onLanguageChange={setLanguage}
            onStatusChange={setStatus}
            onSortChange={setSortBy}
            onResetFilters={resetFilters}
          />

          <ProjectGrid
            projects={projects}
            categories={categories}
            isLoading={isLoading}
            onResetFilters={resetFilters}
          />
        </section>
      </main>

      <Footer repoUrl={SITE_CONFIG.repoUrl} />
    </div>
  );
};
