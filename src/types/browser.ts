export type DistroProfile = 'ubuntu' | 'opensuse';
export type ThemeMode = 'dark' | 'light';
export type TabLayout = 'vertical' | 'horizontal';
export type SidebarSide = 'left' | 'right';
export type SearchEngine = 'duckduckgo' | 'wikipedia' | 'startpage' | 'google';

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  history: string[];
  historyIndex: number;
  favicon?: string;
  isPinned: boolean;
  isPrivate: boolean;
  isLoading: boolean;
  isMuted: boolean;
  readerMode: boolean;
  zoom: number;
  groupId?: string;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  folder: string;
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  visitedAt: string;
}

export interface BrowserSettings {
  distro: DistroProfile;
  theme: ThemeMode;
  tabLayout: TabLayout;
  verticalTabsCollapsed: boolean;
  sidebarSide: SidebarSide;
  searchEngine: SearchEngine;
  homepage: string;
  showBookmarksBar: boolean;
}

export interface QuickLink {
  title: string;
  url: string;
  description: string;
  category: 'Linux' | 'Docs' | 'Web';
}
