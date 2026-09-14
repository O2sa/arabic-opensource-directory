import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { EcosystemStats } from '../types';
import { Sparkles, Star, Activity, Layers, Package, ArrowDown } from 'lucide-react';

interface HeroProps {
  stats: EcosystemStats;
  repoUrl?: string;
}

export const Hero: React.FC<HeroProps> = ({ stats, repoUrl = 'https://github.com/' }) => {
  const { lang, t } = useLanguage();

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(num);
  };

  return (
    <section style={{
      position: 'relative',
      paddingTop: '3.5rem',
      paddingBottom: '3.5rem',
      overflow: 'hidden',
    }}>
      {/* Background ambient gradient glow */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
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
        }}>
          <Sparkles size={15} />
          <span>
            {lang === 'ar' ? 'الدليل الحي والمفتوح للبرمجيات العربية' : 'The Living Hub for Arabic Open Source'}
          </span>
        </div>

        {/* Main Heading */}
        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
          fontWeight: 800,
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          maxWidth: '900px',
          margin: '0 auto 1.25rem',
          color: 'var(--text-primary)',
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
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: 'var(--text-secondary)',
          maxWidth: '750px',
          margin: '0 auto 2.25rem',
          lineHeight: 1.6,
        }}>
          {t('siteSubtitle')}
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '3.5rem',
        }}>
          <a href="#projects" className="btn btn-primary" style={{ padding: '0.75rem 1.6rem', fontSize: '1rem' }}>
            <ArrowDown size={18} />
            <span>{lang === 'ar' ? 'استكشف المشاريع' : 'Explore Projects'}</span>
          </a>
          <a
            href={`${repoUrl}/issues/new?template=submit-project.yml`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ padding: '0.75rem 1.6rem', fontSize: '1rem' }}
          >
            <Package size={18} />
            <span>{t('submitProject')}</span>
          </a>
        </div>

        {/* Ecosystem Live KPI Counters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          maxWidth: '1000px',
          margin: '0 auto',
        }}>
          
          {/* Total Projects */}
          <div className="glass-card" style={{ padding: '1.4rem 1.2rem', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              padding: '0.6rem',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--accent-primary)',
              marginBottom: '0.6rem',
            }}>
              <Package size={22} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {formatNumber(stats.totalProjects)}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontWeight: 500 }}>
              {t('statTotalProjects')}
            </div>
          </div>

          {/* Total Stars */}
          <div className="glass-card" style={{ padding: '1.4rem 1.2rem', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              padding: '0.6rem',
              borderRadius: '10px',
              background: 'rgba(234, 179, 8, 0.12)',
              color: '#eab308',
              marginBottom: '0.6rem',
            }}>
              <Star size={22} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {formatNumber(stats.totalStars)}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontWeight: 500 }}>
              {t('statTotalStars')}
            </div>
          </div>

          {/* Active Health Rate */}
          <div className="glass-card" style={{ padding: '1.4rem 1.2rem', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              padding: '0.6rem',
              borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#3b82f6',
              marginBottom: '0.6rem',
            }}>
              <Activity size={22} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {stats.activePercentage}%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontWeight: 500 }}>
              {t('statActiveRate')}
            </div>
          </div>

          {/* Categories */}
          <div className="glass-card" style={{ padding: '1.4rem 1.2rem', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              padding: '0.6rem',
              borderRadius: '10px',
              background: 'rgba(168, 85, 247, 0.12)',
              color: '#a855f7',
              marginBottom: '0.6rem',
            }}>
              <Layers size={22} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {stats.categoryCount}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontWeight: 500 }}>
              {t('statCategories')}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
