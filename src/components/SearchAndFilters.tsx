import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Category, FilterState, SortOption } from '../types';
import {
  Search,
  X,
  Check,
  Cpu,
  Type,
  PenTool,
  Code2,
  ScanText,
  BookOpen,
  Database,
  Globe,
  Filter,
  RotateCcw,
  Sparkles,
  LucideIcon,
} from 'lucide-react';

interface SearchAndFiltersProps {
  categories: Category[];
  filters: FilterState;
  categoryCounts: Record<string, number>;
  availableLanguages: string[];
  totalFiltered: number;
  onSearchChange: (query: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onToggleCategory?: (categoryId: string) => void;
  onLanguageChange: (language: string) => void;
  onStatusChange: (status: FilterState['status']) => void;
  onSortChange: (sortBy: SortOption) => void;
  onResetFilters: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  Cpu,
  Type,
  PenTool,
  Code2,
  ScanText,
  BookOpen,
  Database,
  Globe,
};

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  categories,
  filters,
  categoryCounts,
  availableLanguages,
  totalFiltered,
  onSearchChange,
  onCategoryChange,
  onToggleCategory,
  onLanguageChange,
  onStatusChange,
  onSortChange,
  onResetFilters,
}) => {
  const { lang, t } = useLanguage();

  const handleCategoryClick = (categoryId: string) => {
    if (onToggleCategory) {
      onToggleCategory(categoryId);
    } else {
      onCategoryChange(categoryId);
    }
  };

  const selectedCategories = filters.categories && filters.categories.length > 0
    ? filters.categories
    : (filters.category && filters.category !== 'all' ? [filters.category] : []);
  const isAllSelected = selectedCategories.length === 0;

  const isFiltered =
    Boolean(filters.search) ||
    selectedCategories.length > 0 ||
    filters.language !== 'all' ||
    filters.status !== 'all' ||
    filters.sortBy !== 'stars';

  return (
    <div id="projects" style={{ marginBottom: '2rem', width: '100%', maxWidth: '100%' }}>
      
      {/* Search Input Bar */}
      <div style={{ position: 'relative', marginBottom: '1.25rem', width: '100%' }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          [lang === 'ar' ? 'right' : 'left']: '1.15rem',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
        }}>
          <Search size={19} />
        </div>

        <input
          type="text"
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="search-input"
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--accent-primary)';
            e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-subtle)';
            e.target.style.boxShadow = 'var(--card-shadow)';
          }}
        />

        {filters.search && (
          <button
            onClick={() => onSearchChange('')}
            className="btn-icon"
            style={{
              position: 'absolute',
              top: '50%',
              [lang === 'ar' ? 'left' : 'right']: '0.85rem',
              transform: 'translateY(-50%)',
              padding: '0.35rem',
              borderRadius: '9999px',
            }}
            title="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Category Pills (Horizontal scrolling bar) */}
      <div className="category-scroll-bar">
        {/* 'All' category pill */}
        <button
          onClick={() => handleCategoryClick('all')}
          aria-pressed={isAllSelected}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.55rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: 'pointer',
            border: '1px solid',
            whiteSpace: 'nowrap',
            transition: 'all var(--transition-fast)',
            borderColor: isAllSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
            background: isAllSelected ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            color: isAllSelected ? '#ffffff' : 'var(--text-secondary)',
            boxShadow: isAllSelected ? '0 2px 10px var(--accent-glow)' : 'none',
          }}
        >
          {isAllSelected ? <Check size={14} strokeWidth={2.5} /> : <Sparkles size={15} />}
          <span>{t('allCategories')}</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.1rem 0.45rem',
            borderRadius: '9999px',
            background: isAllSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-tertiary)',
            color: isAllSelected ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
          }}>
            {categoryCounts.all || 0}
          </span>
        </button>

        {/* Individual category pills */}
        {categories.map((category) => {
          const IconComponent = iconMap[category.icon] || Code2;
          const isSelected = selectedCategories.includes(category.id);
          const count = categoryCounts[category.id] || 0;

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              aria-pressed={isSelected}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: 'pointer',
                border: '1px solid',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
                borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                background: isSelected ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: isSelected ? '0 2px 10px var(--accent-glow)' : 'none',
              }}
            >
              {isSelected ? (
                <Check size={14} strokeWidth={2.5} />
              ) : (
                <IconComponent size={15} />
              )}
              <span>{category.name[lang] || category.name.en}</span>
              <span style={{
                fontSize: '0.75rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                background: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-tertiary)',
                color: isSelected ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 700,
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Multi-category summary chips bar (visible when 2 or more categories are selected) */}
      {selectedCategories.length >= 2 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginTop: '0.85rem',
          marginBottom: '0.25rem',
          padding: '0.5rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px dashed var(--accent-primary)',
          fontSize: '0.825rem',
          color: 'var(--text-primary)',
        }}>
          <span style={{ fontWeight: 600, color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={14} />
            <span>{selectedCategories.length} {t('categoriesSelected')}:</span>
          </span>
          {selectedCategories.map(catId => {
            const catObj = categories.find(c => c.id === catId);
            const name = catObj ? (catObj.name[lang] || catObj.name.en) : catId;
            return (
              <span
                key={catId}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                <span>{name}</span>
                <button
                  onClick={() => handleCategoryClick(catId)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.1rem',
                    color: 'var(--text-muted)',
                    borderRadius: '50%',
                  }}
                  title="Remove category"
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
          <button
            onClick={() => handleCategoryClick('all')}
            style={{
              marginInlineStart: 'auto',
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '0.2rem 0.4rem',
            }}
          >
            {t('clearCategories')}
          </button>
        </div>
      )}

      {/* Secondary Controls Bar: Language, Status, Sort & Result Count */}
      <div className="filters-bar-container">
        
        {/* Left Side: Filter Selects */}
        <div className="filters-controls-wrap">
          
          <div className="hide-mobile" style={{ alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Filter size={15} />
          </div>

          {/* Programming Language Select */}
          <select
            value={filters.language}
            onChange={(e) => onLanguageChange(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              cursor: 'pointer',
              outline: 'none',
              minHeight: '38px',
            }}
          >
            <option value="all">{t('allLanguages')}</option>
            {availableLanguages.map((langName) => (
              <option key={langName} value={langName}>
                {langName}
              </option>
            ))}
          </select>

          {/* Activity Status Select */}
          <select
            value={filters.status}
            onChange={(e) => onStatusChange(e.target.value as FilterState['status'])}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              cursor: 'pointer',
              outline: 'none',
              minHeight: '38px',
            }}
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="active">{t('statusActive')}</option>
            <option value="maintained">{t('statusMaintained')}</option>
            <option value="archived">{t('statusArchived')}</option>
          </select>

          {/* Sort By Select */}
          <select
            value={filters.sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              cursor: 'pointer',
              outline: 'none',
              minHeight: '38px',
            }}
          >
            <option value="stars">{t('sortStars')}</option>
            <option value="updated">{t('sortUpdated')}</option>
            <option value="name">{t('sortName')}</option>
          </select>

          {/* Reset Filters button */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="btn btn-secondary filter-reset-action"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem', minHeight: '38px' }}
            >
              <RotateCcw size={13} />
              <span>{t('resetFilters')}</span>
            </button>
          )}

        </div>

        {/* Right Side: Total Matching Count */}
        <div className="filters-count-info" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {lang === 'ar' ? (
            <>
              عرض <strong style={{ color: 'var(--accent-primary)' }}>{totalFiltered}</strong> مشروع
            </>
          ) : (
            <>
              Showing <strong style={{ color: 'var(--accent-primary)' }}>{totalFiltered}</strong> projects
            </>
          )}
        </div>

      </div>

    </div>
  );
};
