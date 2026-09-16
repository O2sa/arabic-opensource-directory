export type Locale = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';
export type Theme = 'dark' | 'light';

export interface BilingualText {
  ar: string;
  en: string;
}

export interface Category {
  id: string;
  name: BilingualText;
  description: BilingualText;
  icon: string;
}

export interface CuratedProject {
  id: string;
  repo: string; // e.g. "owner/repo"
  category: string;
  title: BilingualText;
  description: BilingualText;
  homepage?: string;
  featured?: boolean;
  tags: string[];
}

export interface GitHubLicense {
  spdxId?: string;
  name?: string;
}

export interface GitHubRelease {
  tag: string;
  publishedAt: string;
}

export interface GitHubMetrics {
  owner: string;
  name: string;
  url: string;
  stars: number;
  forks: number;
  openIssues: number;
  license?: GitHubLicense;
  primaryLanguage?: string;
  lastCommitAt?: string;
  latestRelease?: GitHubRelease | null;
  isArchived: boolean;
  topics: string[];
}

export type ActivityStatus = 'active' | 'maintained' | 'inactive' | 'archived';

export interface EnrichedProject extends CuratedProject {
  github?: GitHubMetrics;
  activityStatus: ActivityStatus;
  lastSyncedAt?: string;
}

export type SortOption = 'stars' | 'updated' | 'name';

export interface FilterState {
  search: string;
  categories: string[]; // empty array means all categories
  category?: string; // kept for backward compatibility
  language: string; // 'all' or specific programming language
  status: 'all' | 'active' | 'maintained' | 'archived';
  sortBy: SortOption;
}

export interface EcosystemStats {
  totalProjects: number;
  totalStars: number;
  activePercentage: number;
  categoryCount: number;
}
