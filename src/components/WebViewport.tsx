import {useEffect, useRef, useState} from 'react';
import {ArrowDown, ArrowUp, ExternalLink, Loader2, X} from 'lucide-react';
import {BookmarkItem, BrowserSettings, BrowserTab, HistoryItem} from '../types/browser';
import {isInternalUrl} from '../utils/url';
import {BookmarksPage} from './pages/BookmarksPage';
import {HistoryPage} from './pages/HistoryPage';
import {LinuxBuildPage} from './pages/LinuxBuildPage';
import {NewTabPage} from './pages/NewTabPage';
import {SettingsPage} from './pages/SettingsPage';

interface ReaderData {
  url: string;
  hostname: string;
  title: string;
  blocks: Array<{tag: 'h1' | 'h2' | 'p' | 'li'; text: string}>;
}

interface InspectorData {
  url: string;
  status: number;
  statusText: string;
  elapsedMs: number;
  bytes: number;
  headers: Record<string, string>;
  source: string;
}

interface WebViewportProps {
  tab: BrowserTab;
  reloadNonce: number;
  settings: BrowserSettings;
  bookmarks: BookmarkItem[];
  history: HistoryItem[];
  findOpen: boolean;
  inspectorOpen: boolean;
  onCloseFind: () => void;
  onCloseInspector: () => void;
  onNavigate: (input: string, newTab?: boolean) => void;
  onFinishLoad: (tabId: string) => void;
  onToggleVerticalTabs: () => void;
  onUpdateSettings: (patch: Partial<BrowserSettings>) => void;
  onAddBookmark: (title: string, url: string, folder: string) => void;
  onDeleteBookmark: (id: string) => void;
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
  onResetAll: () => void;
}

export function WebViewport({
  tab,
  reloadNonce,
  settings,
  bookmarks,
  history,
  findOpen,
  inspectorOpen,
  onCloseFind,
  onCloseInspector,
  onNavigate,
  onFinishLoad,
  onToggleVerticalTabs,
  onUpdateSettings,
  onAddBookmark,
  onDeleteBookmark,
  onDeleteHistory,
  onClearHistory,
  onResetAll,
}: WebViewportProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [findQuery, setFindQuery] = useState('');
  const [readerData, setReaderData] = useState<ReaderData | null>(null);
  const [readerLoading, setReaderLoading] = useState(false);
  const [readerError, setReaderError] = useState<string | null>(null);
  const [inspectorData, setInspectorData] = useState<InspectorData | null>(null);
  const [inspectorLoading, setInspectorLoading] = useState(false);
  const [inspectorError, setInspectorError] = useState<string | null>(null);

  const isInternal = isInternalUrl(tab.url);

  // Fetch Reader Mode content when toggled on
  useEffect(() => {
    if (!tab.readerMode || isInternal) {
      setReaderData(null);
      setReaderError(null);
      return;
    }
    let cancelled = false;
    setReaderLoading(true);
    setReaderError(null);

    fetch(`/api/reader?url=${encodeURIComponent(tab.url)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Reader extraction failed');
        if (!cancelled) setReaderData(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setReaderError(err instanceof Error ? err.message : 'Unable to load reader view');
        }
      })
      .finally(() => {
        if (!cancelled) setReaderLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab.readerMode, tab.url, isInternal]);

  // Fetch HTTP & HTML Source Inspector when open
  useEffect(() => {
    if (!inspectorOpen || isInternal) {
      setInspectorData(null);
      setInspectorError(null);
      return;
    }
    let cancelled = false;
    setInspectorLoading(true);
    setInspectorError(null);

    fetch(`/api/source?url=${encodeURIComponent(tab.url)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Inspector failed');
        if (!cancelled) setInspectorData(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setInspectorError(err instanceof Error ? err.message : 'Unable to inspect source');
        }
      })
      .finally(() => {
        if (!cancelled) setInspectorLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [inspectorOpen, tab.url, reloadNonce, isInternal]);

  const sendFind = (backwards = false) => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      {type: 'tuxpane-find', query: findQuery, backwards},
      '*'
    );
  };

  const renderInternalPage = () => {
    switch (tab.url) {
      case 'browse://bookmarks':
        return (
          <BookmarksPage
            bookmarks={bookmarks}
            onOpenUrl={(url, newTab) => onNavigate(url, newTab)}
            onAddBookmark={onAddBookmark}
            onDeleteBookmark={onDeleteBookmark}
          />
        );
      case 'browse://history':
        return (
          <HistoryPage
            history={history}
            onOpenUrl={(url, newTab) => onNavigate(url, newTab)}
            onDeleteEntry={onDeleteHistory}
            onClearHistory={onClearHistory}
          />
        );
      case 'browse://settings':
        return (
          <SettingsPage
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            onResetAll={onResetAll}
          />
        );
      case 'browse://linux-build':
        return <LinuxBuildPage initialDistro={settings.distro} />;
      case 'browse://newtab':
      default:
        return (
          <NewTabPage
            settings={settings}
            isPrivate={tab.isPrivate}
            onNavigate={(input) => onNavigate(input)}
            onToggleVerticalTabs={onToggleVerticalTabs}
            onToggleDistro={(distro) => onUpdateSettings({distro})}
          />
        );
    }
  };

  const proxySrc = !isInternal
    ? `/api/proxy?url=${encodeURIComponent(tab.url)}&tabId=${encodeURIComponent(tab.id)}&r=${reloadNonce}`
    : '';

  return (
    <div className="relative flex-1 min-w-0 flex flex-col bg-white dark:bg-[#111317] overflow-hidden">
      {/* Top loading progress bar */}
      {tab.isLoading && !isInternal && (
        <div className="h-0.5 w-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0">
          <div className="h-full w-1/3 bg-[var(--accent)] animate-[loadingSlide_1s_ease-in-out_infinite]" />
        </div>
      )}

      {/* Find-in-page bar */}
      {findOpen && !isInternal && (
        <div className="flex items-center justify-between gap-2 px-4 py-1.5 bg-neutral-100 dark:bg-[#1a1d23] border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={findQuery}
              onChange={(e) => setFindQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendFind(e.shiftKey);
                if (e.key === 'Escape') onCloseFind();
              }}
              placeholder="Find in page..."
              autoFocus
              className="w-64 px-2.5 py-1 text-xs rounded-md bg-white dark:bg-[#111317] border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
            <button
              type="button"
              onClick={() => sendFind(true)}
              title="Previous match"
              className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => sendFind(false)}
              title="Next match"
              className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={onCloseFind}
            aria-label="Close find bar"
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Split: Page Viewport + Optional Inspector */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="flex-1 min-w-0 h-full relative overflow-hidden">
          {isInternal ? (
            renderInternalPage()
          ) : tab.readerMode ? (
            <div className="h-full overflow-y-auto tux-scroll bg-neutral-50 dark:bg-[#14161a] text-neutral-900 dark:text-neutral-100 px-6 py-10">
              <article className="max-w-2xl mx-auto">
                {readerLoading ? (
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Formatting readable article...</span>
                  </div>
                ) : readerError ? (
                  <div className="p-4 rounded-xl bg-white dark:bg-[#1c1f26] border border-neutral-200 dark:border-neutral-800 text-sm">
                    {readerError}
                  </div>
                ) : readerData ? (
                  <>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                      Reader View · {readerData.hostname}
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mb-6">{readerData.title}</h1>
                    <div className="space-y-4 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                      {readerData.blocks.length === 0 ? (
                        <p>No readable article paragraphs detected on this page.</p>
                      ) : (
                        readerData.blocks.map((block, idx) => {
                          if (block.tag === 'h1' || block.tag === 'h2') {
                            return (
                              <h2
                                key={idx}
                                className="text-lg font-semibold text-neutral-900 dark:text-white pt-3"
                              >
                                {block.text}
                              </h2>
                            );
                          }
                          if (block.tag === 'li') {
                            return (
                              <li key={idx} className="ml-5 list-disc">
                                {block.text}
                              </li>
                            );
                          }
                          return <p key={idx}>{block.text}</p>;
                        })
                      )}
                    </div>
                  </>
                ) : null}
              </article>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              key={`${tab.id}-${tab.url}-${reloadNonce}`}
              src={proxySrc}
              title={tab.title || tab.url}
              onLoad={() => onFinishLoad(tab.id)}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              className="w-full h-full border-0 bg-white"
            />
          )}
        </div>

        {/* HTTP & HTML Source Inspector Side Panel */}
        {inspectorOpen && !isInternal && (
          <aside className="w-96 shrink-0 border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#16181d] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800">
              <span className="text-xs font-semibold">Page Inspector</span>
              <div className="flex items-center gap-2">
                <a
                  href={tab.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open raw URL in host tab"
                  className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={onCloseInspector}
                  aria-label="Close inspector"
                  className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto tux-scroll p-4 flex flex-col gap-4 text-xs">
              {inspectorLoading ? (
                <div className="flex items-center gap-2 text-neutral-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Inspecting response...</span>
                </div>
              ) : inspectorError ? (
                <div className="text-red-500">{inspectorError}</div>
              ) : inspectorData ? (
                <>
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-white dark:bg-[#1e2128] border border-neutral-200 dark:border-neutral-800 tabular-nums">
                    <div>
                      <div className="text-[11px] text-neutral-500">Status</div>
                      <div className="font-mono-code font-semibold mt-0.5">
                        {inspectorData.status}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-neutral-500">Latency</div>
                      <div className="font-mono-code font-semibold mt-0.5">
                        {inspectorData.elapsedMs} ms
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-neutral-500">Size</div>
                      <div className="font-mono-code font-semibold mt-0.5">
                        {(inspectorData.bytes / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold mb-1.5">Response Headers</div>
                    <div className="rounded-lg bg-white dark:bg-[#1e2128] border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800">
                      {Object.entries(inspectorData.headers)
                        .slice(0, 12)
                        .map(([key, value]) => (
                          <div key={key} className="px-2.5 py-1.5 flex flex-col gap-0.5">
                            <span className="font-mono-code text-[11px] text-[var(--accent)]">
                              {key}
                            </span>
                            <span className="font-mono-code text-[11px] text-neutral-600 dark:text-neutral-300 break-all">
                              {value}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold mb-1.5">HTML Source Preview</div>
                    <pre className="p-3 rounded-lg bg-[#0f1115] text-neutral-200 font-mono-code text-[11px] overflow-x-auto max-h-80 leading-relaxed">
                      <code>{inspectorData.source.slice(0, 12000)}</code>
                    </pre>
                  </div>
                </>
              ) : null}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
