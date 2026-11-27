import {BookmarkItem, BrowserSettings, QuickLink} from '../types/browser';

export const DEFAULT_SETTINGS: BrowserSettings = {
  distro: 'ubuntu',
  theme: 'dark',
  tabLayout: 'vertical',
  verticalTabsCollapsed: false,
  sidebarSide: 'left',
  searchEngine: 'duckduckgo',
  homepage: 'browse://newtab',
  showBookmarksBar: true,
};

export const DEFAULT_QUICK_LINKS: QuickLink[] = [
  {
    title: 'Ubuntu Official',
    url: 'https://ubuntu.com',
    description: 'Releases, desktop docs, and Ubuntu Core news',
    category: 'Linux',
  },
  {
    title: 'openSUSE Portal',
    url: 'https://www.opensuse.org',
    description: 'Tumbleweed rolling release and Leap workstation',
    category: 'Linux',
  },
  {
    title: 'openSUSE Wiki',
    url: 'https://en.opensuse.org/Main_Page',
    description: 'Zypper, YaST, Snapper, and system administration',
    category: 'Docs',
  },
  {
    title: 'Ubuntu Community Docs',
    url: 'https://help.ubuntu.com',
    description: 'APT package management and GNOME guides',
    category: 'Docs',
  },
  {
    title: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Main_Page',
    description: 'Free encyclopedia articles and technical references',
    category: 'Web',
  },
  {
    title: 'Hacker News',
    url: 'https://news.ycombinator.com',
    description: 'Systems engineering, Linux, and web discussions',
    category: 'Web',
  },
  {
    title: 'Kernel.org',
    url: 'https://www.kernel.org',
    description: 'Linux kernel archives and mainline release table',
    category: 'Linux',
  },
  {
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org/en-US/',
    description: 'HTML, CSS, DOM, and Web API documentation',
    category: 'Docs',
  },
];

export const DEFAULT_BOOKMARKS: BookmarkItem[] = [
  {
    id: 'bm-ubuntu',
    title: 'Ubuntu',
    url: 'https://ubuntu.com',
    folder: 'Linux Distros',
    createdAt: '2026-11-20',
  },
  {
    id: 'bm-opensuse',
    title: 'openSUSE',
    url: 'https://www.opensuse.org',
    folder: 'Linux Distros',
    createdAt: '2026-11-20',
  },
  {
    id: 'bm-kernel',
    title: 'The Linux Kernel Archives',
    url: 'https://www.kernel.org',
    folder: 'Linux Distros',
    createdAt: '2026-11-21',
  },
  {
    id: 'bm-wiki',
    title: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Main_Page',
    folder: 'Reference',
    createdAt: '2026-11-22',
  },
  {
    id: 'bm-hn',
    title: 'Hacker News',
    url: 'https://news.ycombinator.com',
    folder: 'Reading',
    createdAt: '2026-11-23',
  },
];
