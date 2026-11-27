import {FormEvent, useMemo, useState} from 'react';
import {Bookmark, ExternalLink, Plus, Search, Trash2} from 'lucide-react';
import {BookmarkItem} from '../../types/browser';

interface BookmarksPageProps {
  bookmarks: BookmarkItem[];
  onOpenUrl: (url: string, newTab?: boolean) => void;
  onAddBookmark: (title: string, url: string, folder: string) => void;
  onDeleteBookmark: (id: string) => void;
}

export function BookmarksPage({
  bookmarks,
  onOpenUrl,
  onAddBookmark,
  onDeleteBookmark,
}: BookmarksPageProps) {
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [folder, setFolder] = useState('Linux Distros');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bookmarks;
    return bookmarks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.url.toLowerCase().includes(q) ||
        b.folder.toLowerCase().includes(q)
    );
  }, [bookmarks, search]);

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    const normalized = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    onAddBookmark(title.trim() || normalized, normalized, folder.trim() || 'General');
    setTitle('');
    setUrl('');
  };

  return (
    <div className="h-full overflow-y-auto tux-scroll bg-neutral-50 dark:bg-[#111317] text-neutral-900 dark:text-neutral-100">
      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Bookmarks</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 tabular-nums">
              {bookmarks.length} saved sites stored locally
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookmarks..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#1a1d23] border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
        </div>

        {/* Add Bookmark Form */}
        <form
          onSubmit={handleAdd}
          className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-4 rounded-xl bg-white dark:bg-[#1a1d23] border border-neutral-200 dark:border-neutral-800"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g. ArchWiki)"
            className="sm:col-span-4 px-3 py-1.5 text-xs rounded-lg bg-neutral-50 dark:bg-[#121418] border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://wiki.archlinux.org"
            required
            className="sm:col-span-4 px-3 py-1.5 text-xs font-mono-code rounded-lg bg-neutral-50 dark:bg-[#121418] border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
          <input
            type="text"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            placeholder="Folder"
            className="sm:col-span-2 px-3 py-1.5 text-xs rounded-lg bg-neutral-50 dark:bg-[#121418] border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
          <button
            type="submit"
            className="sm:col-span-2 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Bookmarks Table */}
        <div className="rounded-xl bg-white dark:bg-[#1a1d23] border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <Bookmark className="w-6 h-6 mx-auto text-neutral-400 mb-2" />
              <div className="text-sm font-medium">No bookmarks match your filter</div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Add a URL above or click the star icon in the address bar on any site.
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
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-white truncate">
                      <span className="truncate">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                      <span>{item.folder}</span>
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
                      onClick={() => onDeleteBookmark(item.id)}
                      title="Delete Bookmark"
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
