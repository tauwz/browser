/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useCallback, useEffect, useMemo, useState} from 'react';
import {Bookmark, Code2, Globe} from 'lucide-react';
import {BrowserToolbar} from './components/BrowserToolbar';
import {HorizontalTabStrip} from './components/HorizontalTabStrip';
import {VerticalTabSidebar} from './components/VerticalTabSidebar';
import {WebViewport} from './components/WebViewport';
import {DEFAULT_BOOKMARKS, DEFAULT_SETTINGS} from './data/defaults';
import {BookmarkItem, BrowserSettings, BrowserTab, HistoryItem} from './types/browser';
import {
  createId,
  getDisplayHost,
  getInternalPageTitle,
  isInternalUrl,
  normalizeUserInputToUrl,
} from './utils/url';

const STORAGE_KEYS = {
  settings: 'tuxpane.settings.v1',
  bookmarks: 'tuxpane.bookmarks.v1',
  history: 'tuxpane.history.v1',
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function makeTab(url = 'browse://newtab', isPrivate = false, isPinned = false): BrowserTab {
  const title = isInternalUrl(url) ? getInternalPageTitle(url) : getDisplayHost(url);
  return {
    id: createId('tab'),
    title,
    url,
    history: [url],
    historyIndex: 0,
    isPinned,
    isPrivate,
    isLoading: !isInternalUrl(url),
    isMuted: false,
    readerMode: false,
    zoom: 100,
  };
}

export default function App() {
  const [settings, setSettings] = useState<BrowserSettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...loadJson<Partial<BrowserSettings>>(STORAGE_KEYS.settings, {}),
  }));
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() =>
    loadJson<BookmarkItem[]>(STORAGE_KEYS.bookmarks, DEFAULT_BOOKMARKS)
  );
  const [history, setHistory] = useState<HistoryItem[]>(() =>
    loadJson<HistoryItem[]>(STORAGE_KEYS.history, [])
  );

  const [tabs, setTabs] = useState<BrowserTab[]>(() => [
    makeTab('browse://newtab'),
    makeTab('browse://linux-build'),
  ]);
  const [activeTabId, setActiveTabId] = useState<string>(() => '');
  const [reloadNonce, setReloadNonce] = useState(0);
  const [findOpen, setFindOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  // Ensure activeTabId always points to a valid tab
  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) || tabs[0],
    [tabs, activeTabId]
  );

  useEffect(() => {
    if (!activeTabId && tabs.length > 0) {
      setActiveTabId(tabs[0].id);
    }
  }, [activeTabId, tabs]);

  // Sync theme and distro attributes on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', settings.theme === 'dark');
    root.setAttribute('data-distro', settings.distro);
    try {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    } catch {
      // Ignore storage quota errors
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(bookmarks));
    } catch {
      // Ignore storage quota errors
    }
  }, [bookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
    } catch {
      // Ignore storage quota errors
    }
  }, [history]);

  const recordHistory = useCallback((url: string, title: string, isPrivate: boolean) => {
    if (isPrivate || isInternalUrl(url)) return;
    setHistory((prev) => {
      const next: HistoryItem = {
        id: createId('hist'),
        title: title || getDisplayHost(url),
        url,
        visitedAt: new Date().toISOString(),
      };
      return [next, ...prev.slice(0, 199)];
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<BrowserSettings>) => {
    setSettings((prev) => ({...prev, ...patch}));
  }, []);

  const openNewTab = useCallback((rawInput = 'browse://newtab', isPrivate = false) => {
    const url = normalizeUserInputToUrl(rawInput, settings.searchEngine);
    const tab = makeTab(url, isPrivate);
    setTabs((prev) => [...prev, tab]);
    setActiveTabId(tab.id);
    setFindOpen(false);
  }, [settings.searchEngine]);

  const closeTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => {
        if (prev.length === 1) {
          const reset = makeTab('browse://newtab', prev[0].isPrivate);
          setActiveTabId(reset.id);
          return [reset];
        }
        const idx = prev.findIndex((t) => t.id === tabId);
        const filtered = prev.filter((t) => t.id !== tabId);
        if (activeTab?.id === tabId) {
          const nextTab = filtered[Math.max(0, idx - 1)] || filtered[0];
          setActiveTabId(nextTab.id);
        }
        return filtered;
      });
    },
    [activeTab?.id]
  );

  const navigateTab = useCallback(
    (tabId: string, rawInput: string, inNewTab = false) => {
      const targetUrl = normalizeUserInputToUrl(rawInput, settings.searchEngine);
      if (inNewTab) {
        openNewTab(targetUrl, activeTab?.isPrivate || false);
        return;
      }

      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id !== tabId) return tab;
          const nextHistory = tab.history.slice(0, tab.historyIndex + 1);
          if (nextHistory[nextHistory.length - 1] !== targetUrl) {
            nextHistory.push(targetUrl);
          }
          const title = isInternalUrl(targetUrl)
            ? getInternalPageTitle(targetUrl)
            : getDisplayHost(targetUrl);
          return {
            ...tab,
            url: targetUrl,
            title,
            history: nextHistory,
            historyIndex: nextHistory.length - 1,
            isLoading: !isInternalUrl(targetUrl),
            readerMode: false,
          };
        })
      );
      if (!isInternalUrl(targetUrl)) {
        const current = tabs.find((t) => t.id === tabId);
        recordHistory(targetUrl, getDisplayHost(targetUrl), current?.isPrivate || false);
      }
      setFindOpen(false);
    },
    [activeTab?.isPrivate, openNewTab, recordHistory, settings.searchEngine, tabs]
  );

  const goBack = useCallback(() => {
    if (!activeTab || activeTab.historyIndex <= 0) return;
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTab.id) return tab;
        const nextIdx = tab.historyIndex - 1;
        const url = tab.history[nextIdx];
        return {
          ...tab,
          url,
          title: isInternalUrl(url) ? getInternalPageTitle(url) : getDisplayHost(url),
          historyIndex: nextIdx,
          isLoading: !isInternalUrl(url),
          readerMode: false,
        };
      })
    );
  }, [activeTab]);

  const goForward = useCallback(() => {
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1) return;
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTab.id) return tab;
        const nextIdx = tab.historyIndex + 1;
        const url = tab.history[nextIdx];
        return {
          ...tab,
          url,
          title: isInternalUrl(url) ? getInternalPageTitle(url) : getDisplayHost(url),
          historyIndex: nextIdx,
          isLoading: !isInternalUrl(url),
          readerMode: false,
        };
      })
    );
  }, [activeTab]);

  const reloadActiveTab = useCallback(() => {
    if (!activeTab) return;
    if (!isInternalUrl(activeTab.url)) {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTab.id ? {...t, isLoading: true} : t))
      );
    }
    setReloadNonce((n) => n + 1);
  }, [activeTab]);

  const handleFinishLoad = useCallback((tabId: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? {...t, isLoading: false} : t))
    );
  }, []);

  // Listen for bridge messages from proxied iframes
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'tuxpane-meta' && data.tabId) {
        setTabs((prev) =>
          prev.map((t) => {
            if (t.id !== data.tabId) return t;
            return {
              ...t,
              title: data.title || t.title,
              favicon: data.favicon || t.favicon,
              isLoading: false,
            };
          })
        );
      } else if (data.type === 'tuxpane-navigate' && data.tabId && data.url) {
        navigateTab(data.tabId, data.url, Boolean(data.newTab));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [navigateTab]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.shiftKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        updateSettings({
          tabLayout: settings.tabLayout === 'vertical' ? 'horizontal' : 'vertical',
        });
      } else if (mod && e.key.toLowerCase() === 't') {
        e.preventDefault();
        openNewTab('browse://newtab');
      } else if (mod && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (activeTab) closeTab(activeTab.id);
      } else if (mod && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        const omnibox = document.getElementById('tuxpane-omnibox') as HTMLInputElement | null;
        omnibox?.focus();
        omnibox?.select();
      } else if (mod && e.key.toLowerCase() === 'f') {
        if (activeTab && !isInternalUrl(activeTab.url)) {
          e.preventDefault();
          setFindOpen((prev) => !prev);
        }
      } else if (mod && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        reloadActiveTab();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTab, closeTab, openNewTab, reloadActiveTab, settings.tabLayout, updateSettings]);

  const isBookmarked = useMemo(
    () => (activeTab ? bookmarks.some((b) => b.url === activeTab.url) : false),
    [activeTab, bookmarks]
  );

  const toggleBookmarkForActive = useCallback(() => {
    if (!activeTab) return;
    if (isBookmarked) {
      setBookmarks((prev) => prev.filter((b) => b.url !== activeTab.url));
    } else {
      setBookmarks((prev) => [
        {
          id: createId('bm'),
          title: activeTab.title || getDisplayHost(activeTab.url),
          url: activeTab.url,
          folder: 'Saved',
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);
    }
  }, [activeTab, isBookmarked]);

  const togglePinTab = useCallback((tabId: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? {...t, isPinned: !t.isPinned} : t))
    );
  }, []);

  const toggleMuteTab = useCallback((tabId: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? {...t, isMuted: !t.isMuted} : t))
    );
  }, []);

  const duplicateTab = useCallback((tabId: string) => {
    setTabs((prev) => {
      const target = prev.find((t) => t.id === tabId);
      if (!target) return prev;
      const copy: BrowserTab = {
        ...target,
        id: createId('tab'),
        isPinned: false,
      };
      setActiveTabId(copy.id);
      return [...prev, copy];
    });
  }, []);

  const moveTab = useCallback((tabId: string, direction: 'up' | 'down') => {
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === tabId);
      if (idx === -1) return prev;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  }, []);

  const toggleVerticalTabs = useCallback(() => {
    updateSettings({
      tabLayout: settings.tabLayout === 'vertical' ? 'horizontal' : 'vertical',
    });
  }, [settings.tabLayout, updateSettings]);

  const openInternal = useCallback(
    (url: string) => {
      const existing = tabs.find((t) => t.url === url);
      if (existing) {
        setActiveTabId(existing.id);
      } else {
        openNewTab(url);
      }
    },
    [openNewTab, tabs]
  );

  if (!activeTab) return null;

  const sidebarElement = settings.tabLayout === 'vertical' && (
    <VerticalTabSidebar
      tabs={tabs}
      activeTabId={activeTab.id}
      collapsed={settings.verticalTabsCollapsed}
      side={settings.sidebarSide}
      distro={settings.distro}
      onSelectTab={(id) => {
        setActiveTabId(id);
        setFindOpen(false);
      }}
      onCloseTab={closeTab}
      onNewTab={openNewTab}
      onTogglePin={togglePinTab}
      onToggleMute={toggleMuteTab}
      onDuplicateTab={duplicateTab}
      onMoveTab={moveTab}
      onToggleCollapse={() =>
        updateSettings({verticalTabsCollapsed: !settings.verticalTabsCollapsed})
      }
      onSwitchToHorizontal={() => updateSettings({tabLayout: 'horizontal'})}
    />
  );

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-neutral-50 dark:bg-[#111317] text-neutral-900 dark:text-neutral-100">
      {/* Horizontal Tab Strip when Vertical Tabs is disabled */}
      {settings.tabLayout === 'horizontal' && (
        <HorizontalTabStrip
          tabs={tabs}
          activeTabId={activeTab.id}
          distro={settings.distro}
          onSelectTab={(id) => {
            setActiveTabId(id);
            setFindOpen(false);
          }}
          onCloseTab={closeTab}
          onNewTab={(url) => openNewTab(url)}
          onEnableVerticalTabs={() => updateSettings({tabLayout: 'vertical'})}
        />
      )}

      {/* Primary Browser Toolbar */}
      <BrowserToolbar
        activeTab={activeTab}
        settings={settings}
        isBookmarked={isBookmarked}
        inspectorOpen={inspectorOpen}
        onNavigate={(input) => navigateTab(activeTab.id, input)}
        onBack={goBack}
        onForward={goForward}
        onReload={reloadActiveTab}
        onHome={() => navigateTab(activeTab.id, settings.homepage)}
        onToggleBookmark={toggleBookmarkForActive}
        onToggleReaderMode={() =>
          setTabs((prev) =>
            prev.map((t) =>
              t.id === activeTab.id ? {...t, readerMode: !t.readerMode} : t
            )
          )
        }
        onToggleInspector={() => setInspectorOpen((v) => !v)}
        onToggleVerticalTabs={toggleVerticalTabs}
        onToggleDistro={() =>
          updateSettings({
            distro: settings.distro === 'ubuntu' ? 'opensuse' : 'ubuntu',
          })
        }
        onToggleTheme={() =>
          updateSettings({
            theme: settings.theme === 'dark' ? 'light' : 'dark',
          })
        }
        onOpenInternal={openInternal}
        onOpenFind={() => setFindOpen((v) => !v)}
      />

      {/* Optional Slim Bookmarks Bar */}
      {settings.showBookmarksBar && (
        <div className="flex items-center gap-1 px-3 py-1 bg-neutral-50 dark:bg-[#191b20] border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto tux-scroll text-xs">
          {bookmarks.slice(0, 7).map((bm) => (
            <button
              key={bm.id}
              type="button"
              onClick={() => navigateTab(activeTab.id, bm.url)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Globe className="w-3 h-3 text-neutral-400" />
              <span className="max-w-[140px] truncate">{bm.title}</span>
            </button>
          ))}
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => openInternal('browse://bookmarks')}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Bookmark className="w-3 h-3" />
            <span>All Bookmarks</span>
          </button>
          <button
            type="button"
            onClick={() => openInternal('browse://linux-build')}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[var(--accent)] hover:bg-[var(--accent-soft)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Code2 className="w-3 h-3" />
            <span>Ubuntu / openSUSE Code</span>
          </button>
        </div>
      )}

      {/* Main Content Area: Vertical Tab Sidebar + Web Viewport */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {settings.sidebarSide === 'left' && sidebarElement}

        <WebViewport
          tab={activeTab}
          reloadNonce={reloadNonce}
          settings={settings}
          bookmarks={bookmarks}
          history={history}
          findOpen={findOpen}
          inspectorOpen={inspectorOpen}
          onCloseFind={() => setFindOpen(false)}
          onCloseInspector={() => setInspectorOpen(false)}
          onNavigate={(input, inNewTab) => navigateTab(activeTab.id, input, inNewTab)}
          onFinishLoad={handleFinishLoad}
          onToggleVerticalTabs={toggleVerticalTabs}
          onUpdateSettings={updateSettings}
          onAddBookmark={(title, url, folder) =>
            setBookmarks((prev) => [
              {
                id: createId('bm'),
                title,
                url,
                folder,
                createdAt: new Date().toISOString().slice(0, 10),
              },
              ...prev,
            ])
          }
          onDeleteBookmark={(id) =>
            setBookmarks((prev) => prev.filter((b) => b.id !== id))
          }
          onDeleteHistory={(id) =>
            setHistory((prev) => prev.filter((h) => h.id !== id))
          }
          onClearHistory={() => setHistory([])}
          onResetAll={() => {
            setSettings(DEFAULT_SETTINGS);
            setBookmarks(DEFAULT_BOOKMARKS);
            setHistory([]);
          }}
        />

        {settings.sidebarSide === 'right' && sidebarElement}
      </div>
    </div>
  );
}
