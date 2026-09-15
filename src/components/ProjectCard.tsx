import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { EnrichedProject, Category } from '../types';
import {
  Star,
  GitFork,
  ExternalLink,
  Tag,
  Scale,
  Calendar,
} from 'lucide-react';
import { GithubIcon } from './GithubIcon';

interface ProjectCardProps {
  project: EnrichedProject;
  categories: Category[];
}

// Relative time formatter for last commit date
function formatRelativeDate(isoString: string | undefined, locale: 'ar' | 'en'): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return locale === 'ar' ? 'اليوم' : 'Today';
  if (diffDays === 1) return locale === 'ar' ? 'أمس' : 'Yesterday';
  if (diffDays < 30) return locale === 'ar' ? `قبل ${diffDays} يوم` : `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return locale === 'ar' ? `قبل ${diffMonths} شهر` : `${diffMonths}mo ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return locale === 'ar' ? `قبل ${diffYears} سنة` : `${diffYears}y ago`;
}

// Compact star formatter (e.g. 1240 -> 1.2k)
function formatCompactNumber(num: number | undefined): string {
  if (num === undefined || num === null) return '0';
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, categories }) => {
  const { lang, t } = useLanguage();

  const category = categories.find(c => c.id === project.category);
  const categoryName = category?.name[lang] || category?.name.en || project.category;

  const title = project.title[lang] || project.title.en;
  const description = project.description[lang] || project.description.en;

  const githubUrl = project.github?.url || `https://github.com/${project.repo}`;
  const starsCount = project.github?.stars ?? 0;
  const forksCount = project.github?.forks ?? 0;
  const language = project.github?.primaryLanguage;
  const licenseName = project.github?.license?.spdxId || project.github?.license?.name;
  const latestRelease = project.github?.latestRelease?.tag;
  const lastCommitTime = formatRelativeDate(project.github?.lastCommitAt, lang);

  // Status label
  const statusLabel = {
    active: t('statusActive'),
    maintained: t('statusMaintained'),
    inactive: t('statusInactive'),
    archived: t('statusArchived'),
  }[project.activityStatus];

  return (
    <article className="glass-card project-card">
      
      {/* Top Meta: Category & Activity Status */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          {/* Category Badge */}
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.2rem 0.65rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-tertiary)',
            color: 'var(--accent-primary)',
            border: '1px solid var(--border-subtle)',
          }}>
            {categoryName}
          </span>

          {/* Activity Status Pulse */}
          <div className={`status-indicator status-${project.activityStatus}`}>
            <span className="status-dot" />
            <span>{statusLabel}</span>
          </div>
        </div>

        {/* Title and Repo Handle */}
        <h3 style={{
          fontSize: '1.3rem',
          fontWeight: 700,
          marginBottom: '0.35rem',
          color: 'var(--text-primary)',
          lineHeight: 1.3,
        }}>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', transition: 'color var(--transition-fast)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
          >
            {title}
          </a>
        </h3>

        <div style={{
          fontSize: '0.8rem',
          fontFamily: 'var(--font-code)',
          color: 'var(--text-muted)',
          marginBottom: '0.85rem',
          direction: 'ltr',
          textAlign: lang === 'ar' ? 'right' : 'left',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {project.repo}
        </div>

        {/* Description */}
        <p style={{
          fontSize: '0.925rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '1.25rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '4.4rem',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
        }}>
          {description}
        </p>

        {/* Tags */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          marginBottom: '1.25rem',
        }}>
          {language && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.725rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--accent-primary)',
            }}>
              {language}
            </span>
          )}

          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '0.725rem',
                fontWeight: 500,
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-muted)',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Telemetry Bar & Action Links */}
      <div style={{ width: '100%', minWidth: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
          width: '100%',
        }}>
          
          {/* Stars & Forks */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700, color: 'var(--text-primary)' }} title="GitHub Stars">
              <Star size={14} color="#eab308" fill="#eab308" />
              <span>{formatCompactNumber(starsCount)}</span>
            </span>

            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="Forks">
              <GitFork size={14} />
              <span>{formatCompactNumber(forksCount)}</span>
            </span>
          </div>

          {/* Release / License / Last Commit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', minWidth: 0 }}>
            {latestRelease && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }} title={t('release')}>
                <Tag size={13} style={{ flexShrink: 0 }} />
                <span>{latestRelease}</span>
              </span>
            )}

            {licenseName && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }} title={t('license')}>
                <Scale size={13} style={{ flexShrink: 0 }} />
                <span>{licenseName}</span>
              </span>
            )}

            {lastCommitTime && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }} title={t('lastCommit')}>
                <Calendar size={13} style={{ flexShrink: 0 }} />
                <span>{lastCommitTime}</span>
              </span>
            )}
          </div>

        </div>

        {/* Action Buttons */}
        <div className="project-card-actions">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ flex: 1, minWidth: 0, padding: '0.55rem 0.65rem', fontSize: '0.825rem' }}
          >
            <GithubIcon size={15} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t('viewRepo')}</span>
          </a>

          {project.homepage && (
            <a
              href={project.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ flex: 1, minWidth: 0, padding: '0.55rem 0.65rem', fontSize: '0.825rem' }}
            >
              <ExternalLink size={15} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t('viewDocs')}</span>
            </a>
          )}
        </div>
      </div>

    </article>
  );
};
