import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Globe, Plus } from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { SITE_CONFIG } from '../config/site';

interface NavbarProps {
  repoUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ repoUrl = SITE_CONFIG.repoUrl }) => {
  const { lang, toggleLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="glass-header">
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '3.75rem',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem',
      }}>
        
        {/* Brand Logo & Name */}
        <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', minWidth: 0 }}>
          <div style={{
            width: '2.4rem',
            height: '2.4rem',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.25rem',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
            userSelect: 'none',
            flexShrink: 0,
          }}>
            ض
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{
              display: 'block',
              fontSize: 'clamp(0.925rem, 3.2vw, 1.15rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {lang === 'ar' ? 'دليل المصادر المفتوحة' : 'Arabic Open Source'}
            </span>
            <span className="hide-xs" style={{
              display: 'block',
              fontSize: '0.725rem',
              fontWeight: 500,
              color: 'var(--accent-primary)',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}>
              {lang === 'ar' ? 'البرمجيات والذكاء الاصطناعي' : 'Directory & Hub'}
            </span>
          </div>
        </a>

        {/* Actions & Utilities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
          
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="btn btn-secondary"
            title={lang === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
            style={{ padding: '0.45rem 0.65rem', fontSize: '0.825rem', fontWeight: 600 }}
          >
            <Globe size={15} />
            <span className="hide-mobile">{lang === 'ar' ? 'English' : 'العربية'}</span>
            <span className="show-mobile" style={{ fontSize: '0.75rem', fontWeight: 700 }}>{lang === 'ar' ? 'EN' : 'ع'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-icon"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* GitHub Repository Link */}
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-icon"
            title="GitHub Repository"
            aria-label="GitHub Repository"
          >
            <GithubIcon size={17} />
          </a>

          {/* Submit Project CTA */}
          <a
            href={`${repoUrl}/issues/new?template=submit-project.yml`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            title={t('submitProject')}
            aria-label={t('submitProject')}
            style={{ padding: '0.45rem 0.75rem', display: 'flex', alignItems: 'center' }}
          >
            <Plus size={16} />
            <span className="hide-mobile">{t('submitProject')}</span>
          </a>

        </div>

      </div>
    </header>
  );
};
