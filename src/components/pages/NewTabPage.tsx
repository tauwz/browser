import {FormEvent, useState} from 'react';
import {ArrowUpRight, Code2, ExternalLink, PanelLeft, Search, SlidersHorizontal} from 'lucide-react';
import {DEFAULT_QUICK_LINKS} from '../../data/defaults';
import {BrowserSettings} from '../../types/browser';
import {DistroIcon} from '../DistroIcon';

interface NewTabPageProps {
  settings: BrowserSettings;
  isPrivate: boolean;
  onNavigate: (input: string) => void;
  onToggleVerticalTabs: () => void;
  onToggleDistro: (distro: 'ubuntu' | 'opensuse') => void;
}

const WALLPAPERS = {
  ubuntu: '/src/assets/images/ubuntu_horizon_wallpaper_1795720367361.jpg',
  opensuse: '/src/assets/images/opensuse_alpine_wallpaper_1795720366991.jpg',
};

export function NewTabPage({
  settings,
  isPrivate,
  onNavigate,
  onToggleVerticalTabs,
  onToggleDistro,
}: NewTabPageProps) {
  const [query, setQuery] = useState('');
  const [imgError, setImgError] = useState(false);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onNavigate(query.trim());
    }
  };

  const wallpaperSrc = WALLPAPERS[settings.distro];

  return (
    <div className="relative h-full w-full overflow-y-auto tux-scroll bg-neutral-50 dark:bg-[#111317] text-neutral-900 dark:text-neutral-100">
      {/* Subtle hero backdrop banner */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden border-b border-neutral-200 dark:border-neutral-800">
        {!imgError ? (
          <img
            src={wallpaperSrc}
            alt={settings.distro === 'ubuntu' ? 'Ubuntu geometric horizon' : 'openSUSE alpine facets'}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />

        <div className="relative z-10 max-w-5xl mx-auto h-full px-6 flex flex-col justify-end pb-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-200 mb-1.5">
                <DistroIcon distro={settings.distro} className="w-4 h-4 text-[var(--accent)]" />
                <span>{settings.distro === 'ubuntu' ? 'Ubuntu Yaru Profile' : 'openSUSE Chameleon Profile'}</span>
                <span aria-hidden="true">·</span>
                <span>{settings.tabLayout === 'vertical' ? 'Vertical Tabs Active' : 'Horizontal Tabs Active'}</span>
                {isPrivate && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Private Session</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                TuxPane Browser
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-lg bg-black/45 border border-white/15 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => onToggleDistro('ubuntu')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    settings.distro === 'ubuntu'
                      ? 'bg-[#e95420] text-white'
                      : 'text-neutral-200 hover:text-white'
                  }`}
                >
                  Ubuntu
                </button>
                <button
                  type="button"
                  onClick={() => onToggleDistro('opensuse')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    settings.distro === 'opensuse'
                      ? 'bg-[#73ba25] text-[#0b1606]'
                      : 'text-neutral-200 hover:text-white'
                  }`}
                >
                  openSUSE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-[#1a1d23] border border-neutral-200 dark:border-neutral-800 focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)] transition-colors">
            <Search className="w-5 h-5 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search with ${settings.searchEngine} or enter a web address (e.g. ubuntu.com, opensuse.org)...`}
              className="flex-1 min-w-0 bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-92 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
            >
              Browse
            </button>
          </div>
        </form>

        {/* Browser Layout & Native Export Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={onToggleVerticalTabs}
            className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-[#1a1d23] border border-neutral-200 dark:border-neutral-800 hover:border-[var(--accent)] text-left transition-colors cursor-pointer"
          >
            <PanelLeft className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                {settings.tabLayout === 'vertical' ? 'Vertical Tabs Enabled' : 'Switch to Vertical Tabs'}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                {settings.tabLayout === 'vertical'
                  ? 'Click to test horizontal tabs, or use Ctrl+Shift+V anytime.'
                  : 'Move open tabs into a collapsible side rail built for widescreen Linux desktops.'}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('browse://linux-build')}
            className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-[#1a1d23] border border-neutral-200 dark:border-neutral-800 hover:border-[var(--accent)] text-left transition-colors cursor-pointer"
          >
            <Code2 className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                Native GTK4 + WebKitGTK Source
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Get the Python 3 + GTK4 desktop browser code with apt &amp; zypper install scripts.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('browse://settings')}
            className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-[#1a1d23] border border-neutral-200 dark:border-neutral-800 hover:border-[var(--accent)] text-left transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                Workspace Preferences
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Dock vertical tabs left or right, choose your search engine, and adjust appearance.
              </p>
            </div>
          </button>
        </div>

        {/* Quick Links Grid */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              Linux &amp; Web Quick Links
            </h2>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {DEFAULT_QUICK_LINKS.length} sites
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DEFAULT_QUICK_LINKS.map((item) => (
              <button
                key={item.url}
                type="button"
                onClick={() => onNavigate(item.url)}
                className="group flex flex-col justify-between p-4 rounded-xl bg-white dark:bg-[#1a1d23] border border-neutral-200 dark:border-neutral-800 hover:border-[var(--accent)] text-left transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {item.category}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[var(--accent)] transition-colors" />
                  </div>
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {item.title}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center gap-1 text-[11px] font-mono-code text-neutral-400 truncate">
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span className="truncate">{item.url.replace(/^https?:\/\//, '')}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
