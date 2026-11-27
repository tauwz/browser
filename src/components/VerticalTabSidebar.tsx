import {useMemo, useState} from 'react';
import {
  ArrowDown,
  ArrowUp,
  Bookmark,
  Code2,
  Copy,
  EyeOff,
  Globe,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Pin,
  PinOff,
  Plus,
  Search,
  Settings,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {BrowserTab, DistroProfile, SidebarSide} from '../types/browser';
import {getDisplayHost, isInternalUrl} from '../utils/url';
import {DistroIcon} from './DistroIcon';

interface VerticalTabSidebarProps {
  tabs: BrowserTab[];
  activeTabId: string;
  collapsed: boolean;
  side: SidebarSide;
  distro: DistroProfile;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: (url?: string, isPrivate?: boolean) => void;
  onTogglePin: (id: string) => void;
  onToggleMute: (id: string) => void;
  onDuplicateTab: (id: string) => void;
  onMoveTab: (id: string, direction: 'up' | 'down') => void;
  onToggleCollapse: () => void;
  onSwitchToHorizontal: () => void;
}

export function VerticalTabSidebar({
  tabs,
  activeTabId,
  collapsed,
  side,
  distro,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onTogglePin,
  onToggleMute,
  onDuplicateTab,
  onMoveTab,
  onToggleCollapse,
  onSwitchToHorizontal,
}: VerticalTabSidebarProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const [contextTabId, setContextTabId] = useState<string | null>(null);

  const pinnedTabs = useMemo(() => tabs.filter((t) => t.isPinned), [tabs]);
  const regularTabs = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    return tabs.filter((t) => {
      if (t.isPinned) return false;
      if (!q) return true;
      return t.title.toLowerCase().includes(q) || t.url.toLowerCase().includes(q);
    });
  }, [tabs, filterQuery]);

  const borderSideClass =
    side === 'left'
      ? 'border-r border-neutral-200 dark:border-neutral-800'
      : 'border-l border-neutral-200 dark:border-neutral-800';

  const CollapseIcon =
    side === 'left'
      ? collapsed
        ? PanelLeftOpen
        : PanelLeftClose
      : collapsed
        ? PanelRightOpen
        : PanelRightClose;

  const renderTabIcon = (tab: BrowserTab) => {
    if (tab.isPrivate) {
      return <EyeOff className="w-4 h-4 shrink-0 text-neutral-500 dark:text-neutral-400" />;
    }
    if (tab.url === 'browse://bookmarks') {
      return <Bookmark className="w-4 h-4 shrink-0 text-neutral-500 dark:text-neutral-400" />;
    }
    if (tab.url === 'browse://history') {
      return <History className="w-4 h-4 shrink-0 text-neutral-500 dark:text-neutral-400" />;
    }
    if (tab.url === 'browse://settings') {
      return <Settings className="w-4 h-4 shrink-0 text-neutral-500 dark:text-neutral-400" />;
    }
    if (tab.url === 'browse://linux-build') {
      return <Code2 className="w-4 h-4 shrink-0 text-neutral-500 dark:text-neutral-400" />;
    }
    if (isInternalUrl(tab.url)) {
      return <DistroIcon distro={distro} className="w-4 h-4 shrink-0 text-[var(--accent)]" />;
    }
    if (tab.favicon) {
      return (
        <img
          src={tab.favicon}
          alt=""
          referrerPolicy="no-referrer"
          className="w-4 h-4 rounded-sm shrink-0 object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }
    return <Globe className="w-4 h-4 shrink-0 text-neutral-500 dark:text-neutral-400" />;
  };

  if (collapsed) {
    return (
      <aside
        aria-label="Vertical Tabs Rail"
        className={`w-14 shrink-0 flex flex-col items-center py-2.5 gap-2 bg-neutral-100 dark:bg-[#1a1c20] ${borderSideClass} select-none`}
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Expand Vertical Tabs"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <CollapseIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onNewTab('browse://newtab')}
          title="New Tab (Ctrl+T)"
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>

        <div className="w-7 h-px bg-neutral-200 dark:bg-neutral-800 my-0.5" />

        <div className="flex-1 w-full flex flex-col items-center gap-1.5 overflow-y-auto tux-scroll px-1.5">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                title={tab.title}
                className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-[#2a2d33] text-neutral-900 dark:text-white ring-1 ring-[var(--accent)]'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70 dark:hover:bg-neutral-800/70'
                }`}
              >
                {renderTabIcon(tab)}
                {tab.isPinned && (
                  <span
                    className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onSwitchToHorizontal}
          title="Switch to Horizontal Tabs"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          Top
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Vertical Tabs Sidebar"
      className={`w-[256px] shrink-0 flex flex-col bg-neutral-100 dark:bg-[#1a1c20] ${borderSideClass} select-none`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between gap-2 px-3 pt-2.5 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <DistroIcon distro={distro} className="w-4 h-4 text-[var(--accent)] shrink-0" />
          <span className="text-xs font-semibold tracking-tight text-neutral-800 dark:text-neutral-100 whitespace-nowrap">
            Vertical Tabs
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
            · {tabs.length}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onSwitchToHorizontal}
            title="Switch to Horizontal Tabs"
            className="px-2 py-1 text-[11px] font-medium rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            Horizontal
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Collapse Sidebar"
            className="p-1.5 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <CollapseIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Search + New Tab */}
      <div className="px-3 pb-2.5 flex flex-col gap-2">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter open tabs..."
            aria-label="Filter open tabs"
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-white dark:bg-[#121417] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
          {filterQuery && (
            <button
              type="button"
              onClick={() => setFilterQuery('')}
              aria-label="Clear tab filter"
              className="absolute right-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onNewTab('browse://newtab', false)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-92 transition-opacity whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Tab</span>
          </button>
          <button
            type="button"
            onClick={() => onNewTab('browse://newtab', true)}
            title="New Private Tab"
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-[#23262c] text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-[#2b2f37] transition-colors whitespace-nowrap cursor-pointer"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pinned Tabs Grid */}
      {pinnedTabs.length > 0 && (
        <div className="px-3 pb-2.5 border-b border-neutral-200 dark:border-neutral-800">
          <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
            Pinned
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {pinnedTabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextTabId(contextTabId === tab.id ? null : tab.id);
                  }}
                  title={`${tab.title} — ${getDisplayHost(tab.url)}`}
                  className={`h-9 flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#282b32] border-[var(--accent)] text-neutral-900 dark:text-white'
                      : 'bg-neutral-50 dark:bg-[#202328] border-neutral-200 dark:border-neutral-800 hover:bg-white dark:hover:bg-[#262930]'
                  }`}
                >
                  {renderTabIcon(tab)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Vertical Tab List */}
      <div className="flex-1 overflow-y-auto tux-scroll px-2 py-2 flex flex-col gap-1">
        {regularTabs.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
            {filterQuery ? 'No matching tabs' : 'All tabs are pinned'}
          </div>
        ) : (
          regularTabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const showMenu = contextTabId === tab.id;
            return (
              <div key={tab.id} className="relative group">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    onSelectTab(tab.id);
                    setContextTabId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectTab(tab.id);
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextTabId(showMenu ? null : tab.id);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#282b32] text-neutral-900 dark:text-white shadow-xs ring-1 ring-neutral-200 dark:ring-neutral-700'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/65 dark:hover:bg-[#23262c]'
                  }`}
                >
                  {renderTabIcon(tab)}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate leading-snug">
                      {tab.title || 'New Tab'}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate leading-tight">
                      {tab.isPrivate ? 'Private · ' : ''}
                      {getDisplayHost(tab.url)}
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(tab.id);
                      }}
                      title="Pin tab"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-opacity cursor-pointer"
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseTab(tab.id);
                      }}
                      title="Close tab (Ctrl+W)"
                      aria-label={`Close ${tab.title}`}
                      className="opacity-70 group-hover:opacity-100 p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-opacity cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {showMenu && (
                  <div className="mt-1 mb-1.5 mx-1 p-1 rounded-lg bg-white dark:bg-[#23262c] border border-neutral-200 dark:border-neutral-700 flex flex-wrap gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        onTogglePin(tab.id);
                        setContextTabId(null);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                    >
                      {tab.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                      <span>{tab.isPinned ? 'Unpin' : 'Pin'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDuplicateTab(tab.id);
                        setContextTabId(null);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Duplicate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onToggleMute(tab.id);
                        setContextTabId(null);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                    >
                      {tab.isMuted ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                      <span>{tab.isMuted ? 'Unmute' : 'Mute'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveTab(tab.id, 'up')}
                      title="Move up"
                      className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveTab(tab.id, 'down')}
                      title="Move down"
                      className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Bottom Quick Actions */}
      <div className="px-2.5 py-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-1 text-neutral-600 dark:text-neutral-400">
        <button
          type="button"
          onClick={() => onNewTab('browse://bookmarks')}
          title="Bookmarks"
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Bookmarks</span>
        </button>
        <button
          type="button"
          onClick={() => onNewTab('browse://linux-build')}
          title="Ubuntu & openSUSE GTK4 Source"
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>GTK4 Code</span>
        </button>
      </div>
    </aside>
  );
}
