import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { EnrichedProject, Category } from '../types';
import { ProjectCard } from './ProjectCard';
import { SearchX, RotateCcw } from 'lucide-react';

interface ProjectGridProps {
  projects: EnrichedProject[];
  categories: Category[];
  isLoading: boolean;
  onResetFilters: () => void;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  categories,
  isLoading,
  onResetFilters,
}) => {
  const { t } = useLanguage();

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

  return (
    <div className="projects-grid">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} categories={categories} />
      ))}
    </div>
  );
};
