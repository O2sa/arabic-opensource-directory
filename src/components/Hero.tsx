import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { EcosystemStats } from '../types';
import { Sparkles, Star, Activity, Layers, Package, ArrowDown } from 'lucide-react';
import { SITE_CONFIG } from '../config/site';

interface HeroProps {
  stats: EcosystemStats;
  repoUrl?: string;
}

export const Hero: React.FC<HeroProps> = ({ stats, repoUrl = SITE_CONFIG.repoUrl }) => {
  const { lang, t } = useLanguage();

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(num);
  };

  return (
    <section className="hero-wrapper">
      {/* Background ambient gradient glow */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(600px, 90vw)',
        height: '350px',
        background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.15), transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        
        {/* Pill Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.9rem',
          borderRadius: '9999px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--accent-primary)',
          marginBottom: '1.25rem',
          maxWidth: '100%',
        }}>
          <Sparkles size={15} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lang === 'ar' ? 'الدليل الحي والمفتوح للبرمجيات العربية' : 'The Living Hub for Arabic Open Source'}
          </span>
        </div>

        {/* Main Heading */}
        <h1 style={{
          fontSize: 'clamp(1.65rem, 5vw, 3.2rem)',
          fontWeight: 800,
          lineHeight: 1.25,
          letterSpacing: '-0.02em',
          maxWidth: '900px',
          margin: '0 auto 1.25rem',
          color: 'var(--text-primary)',
          wordBreak: 'break-word',
        }}>
          {lang === 'ar' ? (
            <>
              كل ما تحتاجه من برمجيات مفتوحة لخدمة{' '}
              <span style={{
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                لغة الضاد
              </span>
            </>
          ) : (
            <>
              The Open Source Ecosystem for the{' '}
              <span style={{
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Arabic Language
              </span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
          color: 'var(--text-secondary)',
          maxWidth: '750px',
          margin: '0 auto 2rem',
          lineHeight: 1.6,
        }}>
          {t('siteSubtitle')}
        </p>

        {/* CTA Buttons */}
        <div className="hero-actions-row" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.85rem',
          flexWrap: 'wrap',
          marginBottom: '3rem',
        }}>
          <a href="#projects" className="btn btn-primary" style={{ padding: '0.75rem 1.6rem', fontSize: '0.975rem' }}>
            <ArrowDown size={18} />
            <span>{lang === 'ar' ? 'استكشف المشاريع' : 'Explore Projects'}</span>
          </a>
          <a
            href={`${repoUrl}/issues/new?template=submit-project.yml`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ padding: '0.75rem 1.6rem', fontSize: '0.975rem' }}
          >
            <Package size={18} />
            <span>{t('submitProject')}</span>
          </a>
        </div>

        {/* Ecosystem Live KPI Counters */}
        <div className="hero-stats-grid">
          
          {/* Total Projects */}
          <div className="glass-card hero-stat-card" style={{ padding: '1.4rem 1.2rem', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              padding: '0.5rem',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--accent-primary)',
              marginBottom: '0.5rem',
            }}>
              <Package size={20} />
            </div>
            <div className="hero-stat-number" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {formatNumber(stats.totalProjects)}
            </div>
            <div className="hero-stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontWeight: 500 }}>
              {t('statTotalProjects')}
            </div>
          </div>

          {/* Total Stars */}
          <div className="glass-card hero-stat-card" style={{ padding: '1.4rem 1.2rem', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              padding: '0.5rem',
              borderRadius: '10px',
              background: 'rgba(234, 179, 8, 0.12)',
              color: '#eab308',
              marginBottom: '0.5rem',
            }}>
              <Star size={20} />
            </div>
            <div className="hero-stat-number" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {formatNumber(stats.totalStars)}
            </div>
            <div className="hero-stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontWeight: 500 }}>
              {t('statTotalStars')}
            </div>
          </div>

          {/* Active Health Rate */}
          <div className="glass-card hero-stat-card" style={{ padding: '1.4rem 1.2rem', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              padding: '0.5rem',
              borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#3b82f6',
              marginBottom: '0.5rem',
            }}>
              <Activity size={20} />
            </div>
            <div className="hero-stat-number" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {stats.activePercentage}%
            </div>
            <div className="hero-stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontWeight: 500 }}>
              {t('statActiveRate')}
            </div>
          </div>

          {/* Categories */}
          <div className="glass-card hero-stat-card" style={{ padding: '1.4rem 1.2rem', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              padding: '0.5rem',
              borderRadius: '10px',
              background: 'rgba(168, 85, 247, 0.12)',
              color: '#a855f7',
              marginBottom: '0.5rem',
            }}>
              <Layers size={20} />
            </div>
            <div className="hero-stat-number" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {stats.categoryCount}
            </div>
            <div className="hero-stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontWeight: 500 }}>
              {t('statCategories')}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
