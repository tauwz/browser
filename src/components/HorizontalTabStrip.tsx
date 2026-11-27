import {EyeOff, Globe, PanelLeft, Plus, X} from 'lucide-react';
import {BrowserTab, DistroProfile} from '../types/browser';
import {isInternalUrl} from '../utils/url';
import {DistroIcon} from './DistroIcon';

interface HorizontalTabStripProps {
  tabs: BrowserTab[];
  activeTabId: string;
  distro: DistroProfile;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: (url?: string) => void;
  onEnableVerticalTabs: () => void;
}

export function HorizontalTabStrip({
  tabs,
  activeTabId,
  distro,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onEnableVerticalTabs,
}: HorizontalTabStripProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-[#16181c] border-b border-neutral-200 dark:border-neutral-800 select-none">
      <button
        type="button"
        onClick={onEnableVerticalTabs}
        title="Enable Vertical Tabs (Ctrl+Shift+V)"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-[#23262c] border border-neutral-200 dark:border-neutral-700 hover:border-[var(--accent)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        <PanelLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
        <span>Vertical Tabs</span>
      </button>

      <div className="flex-1 flex items-center gap-1 overflow-x-auto tux-scroll">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectTab(tab.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTab(tab.id);
                }
              }}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 cursor-pointer ${
                tab.isPinned ? 'max-w-[110px]' : 'min-w-[130px] max-w-[200px]'
              } ${
                isActive
                  ? 'bg-white dark:bg-[#262930] text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70 dark:hover:bg-[#202329] border border-transparent'
              }`}
            >
              {tab.isPrivate ? (
                <EyeOff className="w-3.5 h-3.5 shrink-0" />
              ) : isInternalUrl(tab.url) ? (
                <DistroIcon distro={distro} className="w-3.5 h-3.5 shrink-0 text-[var(--accent)]" />
              ) : (
                <Globe className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="flex-1 truncate font-medium">{tab.title || 'New Tab'}</span>
              {!tab.isPinned && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  aria-label={`Close ${tab.title}`}
                  className="opacity-65 group-hover:opacity-100 p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => onNewTab('browse://newtab')}
          title="New Tab (Ctrl+T)"
          className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
