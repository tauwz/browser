import {FormEvent, useEffect, useState} from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Code2,
  History,
  Home,
  Lock,
  Moon,
  PanelLeft,
  RotateCw,
  Search,
  Settings,
  Sun,
  Terminal,
} from 'lucide-react';
import {BrowserSettings, BrowserTab} from '../types/browser';
import {isInternalUrl} from '../utils/url';
import {DistroIcon} from './DistroIcon';

interface BrowserToolbarProps {
  activeTab: BrowserTab;
  settings: BrowserSettings;
  isBookmarked: boolean;
  inspectorOpen: boolean;
  onNavigate: (input: string) => void;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onHome: () => void;
  onToggleBookmark: () => void;
  onToggleReaderMode: () => void;
  onToggleInspector: () => void;
  onToggleVerticalTabs: () => void;
  onToggleDistro: () => void;
  onToggleTheme: () => void;
  onOpenInternal: (url: string) => void;
  onOpenFind: () => void;
}

export function BrowserToolbar({
  activeTab,
  settings,
  isBookmarked,
  inspectorOpen,
  onNavigate,
  onBack,
  onForward,
  onReload,
  onHome,
  onToggleBookmark,
  onToggleReaderMode,
  onToggleInspector,
  onToggleVerticalTabs,
  onToggleDistro,
  onToggleTheme,
  onOpenInternal,
  onOpenFind,
}: BrowserToolbarProps) {
  const [addressValue, setAddressValue] = useState(activeTab.url);

  useEffect(() => {
    setAddressValue(activeTab.url);
  }, [activeTab.id, activeTab.url]);

  const canGoBack = activeTab.historyIndex > 0;
  const canGoForward = activeTab.historyIndex < activeTab.history.length - 1;
  const isExternal = !isInternalUrl(activeTab.url);
  const isHttps = activeTab.url.startsWith('https://');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onNavigate(addressValue);
  };

  return (
    <header className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-[#1f2227] border-b border-neutral-200 dark:border-neutral-800 select-none">
      {/* Navigation cluster */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onToggleVerticalTabs}
          title={
            settings.tabLayout === 'vertical'
              ? 'Switch to Horizontal Tabs (Ctrl+Shift+V)'
              : 'Switch to Vertical Tabs (Ctrl+Shift+V)'
          }
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
            settings.tabLayout === 'vertical'
              ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
              : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <PanelLeft className="w-4 h-4" />
          <span className="hidden lg:inline">Vertical</span>
        </button>

        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />

        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          title="Back"
          aria-label="Back"
          className="p-1.5 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onForward}
          disabled={!canGoForward}
          title="Forward"
          aria-label="Forward"
          className="p-1.5 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onReload}
          title="Reload (Ctrl+R)"
          aria-label="Reload"
          className="p-1.5 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <RotateCw className={`w-4 h-4 ${activeTab.isLoading ? 'animate-spin text-[var(--accent)]' : ''}`} />
        </button>
        <button
          type="button"
          onClick={onHome}
          title="Home / New Tab"
          aria-label="Home"
          className="p-1.5 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* Omnibox */}
      <form onSubmit={handleSubmit} className="flex-1 min-w-0 flex items-center relative">
        <div className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#131519] border border-neutral-200 dark:border-neutral-800 focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)] transition-colors">
          {isExternal ? (
            <Lock
              className={`w-3.5 h-3.5 shrink-0 ${
                isHttps ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}
            />
          ) : (
            <Search className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
          )}

          <input
            id="tuxpane-omnibox"
            type="text"
            value={addressValue}
            onChange={(e) => setAddressValue(e.target.value)}
            onFocus={(e) => e.currentTarget.select()}
            placeholder="Enter URL (e.g. ubuntu.com, opensuse.org) or search..."
            aria-label="Address bar"
            className="flex-1 min-w-0 bg-transparent text-xs font-mono-code text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
          />

          {isExternal && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={onOpenFind}
                title="Find in page (Ctrl+F)"
                className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onToggleReaderMode}
                title={activeTab.readerMode ? 'Exit Reader Mode' : 'Reader Mode'}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  activeTab.readerMode
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onToggleInspector}
                title="Inspect HTTP & Source"
                className={`p-1 rounded transition-colors cursor-pointer ${
                  inspectorOpen
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleBookmark}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Page'}
            aria-label="Toggle Bookmark"
            className={`p-1 rounded transition-colors shrink-0 cursor-pointer ${
              isBookmarked
                ? 'text-[var(--accent)]'
                : 'text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        </div>
      </form>

      {/* Distro Theme + Browser Utilities */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onToggleDistro}
          title="Switch between Ubuntu and openSUSE theme"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-[#262930] text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 hover:border-[var(--accent)] transition-colors whitespace-nowrap cursor-pointer"
        >
          <DistroIcon distro={settings.distro} className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>{settings.distro === 'ubuntu' ? 'Ubuntu' : 'openSUSE'}</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenInternal('browse://linux-build')}
          title="Native Ubuntu & openSUSE GTK4 Source Code"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Native Linux</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenInternal('browse://history')}
          title="History"
          aria-label="History"
          className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <History className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          title={settings.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Light or Dark Theme"
          className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={() => onOpenInternal('browse://settings')}
          title="Browser Settings"
          aria-label="Settings"
          className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
