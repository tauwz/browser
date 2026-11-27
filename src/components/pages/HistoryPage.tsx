import {useMemo, useState} from 'react';
import {Clock, ExternalLink, Search, Trash2} from 'lucide-react';
import {HistoryItem} from '../../types/browser';

interface HistoryPageProps {
  history: HistoryItem[];
  onOpenUrl: (url: string, newTab?: boolean) => void;
  onDeleteEntry: (id: string) => void;
  onClearHistory: () => void;
}

export function HistoryPage({
  history,
  onOpenUrl,
  onDeleteEntry,
  onClearHistory,
}: HistoryPageProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return history;
    return history.filter(
      (h) => h.title.toLowerCase().includes(q) || h.url.toLowerCase().includes(q)
    );
  }, [history, search]);

  return (
    <div className="h-full overflow-y-auto tux-scroll bg-neutral-50 dark:bg-[#111317] text-neutral-900 dark:text-neutral-100">
      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Browsing History</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 tabular-nums">
              {history.length} recorded visits (private tabs are never logged)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#1a1d23] border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-[#1a1d23] border border-neutral-200 dark:border-neutral-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 whitespace-nowrap cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white dark:bg-[#1a1d23] border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <Clock className="w-6 h-6 mx-auto text-neutral-400 mb-2" />
              <div className="text-sm font-medium">No history entries</div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Pages you visit in regular tabs will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-[#20242b] transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => onOpenUrl(item.url)}
                    className="flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                      <span className="tabular-nums shrink-0">
                        {new Date(item.visitedAt).toLocaleString()}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-code truncate">{item.url}</span>
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenUrl(item.url, true)}
                      title="Open in New Tab"
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteEntry(item.id)}
                      title="Remove Entry"
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
