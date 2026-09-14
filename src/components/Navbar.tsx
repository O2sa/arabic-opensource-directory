import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Globe, Plus } from 'lucide-react';
import { GithubIcon } from './GithubIcon';

interface NavbarProps {
  repoUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ repoUrl = 'https://github.com/' }) => {
  const { lang, toggleLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="glass-header">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.5rem' }}>
        
        {/* Brand Logo & Name */}
        <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none' }}>
          <div style={{
            width: '2.6rem',
            height: '2.6rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.4rem',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
            userSelect: 'none',
          }}>
            ض
          </div>
          <div>
            <span style={{
              display: 'block',
              fontSize: '1.15rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              lineHeight: 1.2
            }}>
              {lang === 'ar' ? 'دليل المصادر المفتوحة' : 'Arabic Open Source'}
            </span>
            <span style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--accent-primary)',
              letterSpacing: '0.02em'
            }}>
              {lang === 'ar' ? 'البرمجيات والذكاء الاصطناعي' : 'Directory & Hub'}
            </span>
          </div>
        </a>

        {/* Actions & Utilities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="btn btn-secondary"
            title={lang === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <Globe size={16} />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-icon"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
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
            <GithubIcon size={18} />
          </a>

          {/* Submit Project CTA */}
          <a
            href={`${repoUrl}/issues/new?template=submit-project.yml`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Plus size={16} />
            <span>{t('submitProject')}</span>
          </a>

        </div>

      </div>
    </header>
  );
};
