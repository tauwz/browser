import {SearchEngine} from '../types/browser';

export const INTERNAL_PAGES: Record<string, string> = {
  'browse://newtab': 'New Tab',
  'browse://bookmarks': 'Bookmarks',
  'browse://history': 'History',
  'browse://settings': 'Browser Settings',
  'browse://linux-build': 'Ubuntu & openSUSE Native Code',
};

export function isInternalUrl(url: string): boolean {
  return url.startsWith('browse://');
}

export function getInternalPageTitle(url: string): string {
  return INTERNAL_PAGES[url] || 'TuxPane';
}

export function normalizeUserInputToUrl(input: string, searchEngine: SearchEngine): string {
  const trimmed = input.trim();
  if (!trimmed) return 'browse://newtab';

  if (trimmed.startsWith('browse://')) {
    return INTERNAL_PAGES[trimmed] ? trimmed : 'browse://newtab';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Domain-like string without spaces (e.g. ubuntu.com, docs.opensuse.org, example.org/path)
  if (!/\s/.test(trimmed) && /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+([/:?#].*)?$/.test(trimmed)) {
    return `https://${trimmed}`;
  }

  const encoded = encodeURIComponent(trimmed);
  switch (searchEngine) {
    case 'wikipedia':
      return `https://en.wikipedia.org/wiki/Special:Search?search=${encoded}`;
    case 'startpage':
      return `https://www.startpage.com/sp/search?query=${encoded}`;
    case 'google':
      return `https://www.google.com/search?q=${encoded}`;
    case 'duckduckgo':
    default:
      return `https://html.duckduckgo.com/html/?q=${encoded}`;
  }
}

export function getDisplayHost(url: string): string {
  if (isInternalUrl(url)) {
    return getInternalPageTitle(url);
  }
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function createId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}
