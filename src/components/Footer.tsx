import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Heart, Plus, Sparkles } from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { SITE_CONFIG } from '../config/site';

interface FooterProps {
  repoUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({ repoUrl = SITE_CONFIG.repoUrl }) => {
  const { lang, t } = useLanguage();

  return (
    <footer style={{
      marginTop: '5rem',
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--bg-secondary)',
      paddingTop: '3.5rem',
      paddingBottom: '2.5rem',
    }}>
      <div className="container">
        
        {/* Contribution Banner Card */}
        <div className="glass-card" style={{
          padding: '2rem 2.5rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)',
          borderColor: 'rgba(16, 185, 129, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '3.5rem',
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--accent-primary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              marginBottom: '0.35rem',
            }}>
              <Sparkles size={16} />
              <span>{lang === 'ar' ? 'المساهمة المفتوحة' : 'Open Contribution'}</span>
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
              {t('contributeBanner')}
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
              {t('contributeBannerDesc')}
            </p>
          </div>

          <a
            href={`${repoUrl}/issues/new?template=submit-project.yml`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem' }}
          >
            <Plus size={18} />
            <span>{t('submitProject')}</span>
          </a>
        </div>

        {/* Footer Meta Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
        }}>
          
          {/* Copyright & Mission statement */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span>{t('footerText')}</span>
          </div>

          {/* Social / GitHub Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: 'var(--text-primary)',
                fontWeight: 600,
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            >
              <GithubIcon size={16} />
              <span>GitHub</span>
            </a>

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>{lang === 'ar' ? 'صُنع بكل' : 'Built with'}</span>
              <Heart size={14} color="#ef4444" fill="#ef4444" />
              <span>{lang === 'ar' ? 'للمجتمع العربي' : 'for the Arabic community'}</span>
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
};
