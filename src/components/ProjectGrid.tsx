import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { EnrichedProject, Category } from '../types';
import { ProjectCard } from './ProjectCard';
import { SearchX, RotateCcw, ChevronDown } from 'lucide-react';

interface ProjectGridProps {
  projects: EnrichedProject[];
  categories: Category[];
  isLoading: boolean;
  onResetFilters: () => void;
}

const PAGE_SIZE = 36;

export const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  categories,
  isLoading,
  onResetFilters,
}) => {
  const { t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Automatically reset visible count when project filtering changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [projects]);

  if (isLoading) {
    return (
      <div className="projects-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="glass-card"
            style={{
              height: '280px',
              padding: '1.5rem',
              opacity: 0.6,
              animation: 'pulse-dot 1.5s infinite ease-in-out',
            }}
          />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div
        className="glass-card"
        style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          maxWidth: '550px',
          margin: '2rem auto',
        }}
      >
        <div style={{
          width: '4rem',
          height: '4rem',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}>
          <SearchX size={32} />
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          {t('noResultsTitle')}
        </h3>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          {t('noResultsDesc')}
        </p>

        <button onClick={onResetFilters} className="btn btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
          <RotateCcw size={16} />
          <span>{t('resetFilters')}</span>
        </button>
      </div>
    );
  }

  const displayedProjects = projects.slice(0, visibleCount);
  const hasMore = visibleCount < projects.length;
  const remainingCount = projects.length - displayedProjects.length;
  const nextBatchCount = Math.min(PAGE_SIZE, remainingCount);
  const progressPercent = Math.min(Math.round((displayedProjects.length / projects.length) * 100), 100);

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, projects.length));
  };

  const handleShowAll = () => {
    setVisibleCount(projects.length);
  };

  return (
    <>
      <div className="projects-grid">
        {displayedProjects.map((project) => (
          <ProjectCard key={project.id} project={project} categories={categories} />
        ))}
      </div>

      {hasMore && (
        <div className="load-more-section">
          <div className="load-more-progress-wrap">
            <span className="load-more-progress-text">
              {t('showingProjectsProgress')
                .replace('{count}', displayedProjects.length.toString())
                .replace('{total}', projects.length.toString())}
            </span>
            <div className="load-more-progress-track">
              <div
                className="load-more-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="load-more-buttons-row">
            <button
              onClick={handleLoadMore}
              className="btn btn-primary load-more-btn"
            >
              <ChevronDown size={18} />
              <span>{t('loadMore')} (+{nextBatchCount})</span>
            </button>

            {remainingCount > PAGE_SIZE && (
              <button
                onClick={handleShowAll}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.55rem 1rem', borderRadius: 'var(--radius-full)' }}
              >
                <span>{t('showAllProjects')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
