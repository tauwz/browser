import {RotateCcw} from 'lucide-react';
import {BrowserSettings, DistroProfile, SearchEngine, SidebarSide, TabLayout, ThemeMode} from '../../types/browser';

interface SettingsPageProps {
  settings: BrowserSettings;
  onUpdateSettings: (patch: Partial<BrowserSettings>) => void;
  onResetAll: () => void;
}

export function SettingsPage({
  settings,
  onUpdateSettings,
  onResetAll,
}: SettingsPageProps) {
  return (
    <div className="h-full overflow-y-auto tux-scroll bg-neutral-50 dark:bg-[#111317] text-neutral-900 dark:text-neutral-100">
      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Browser Settings</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Configure vertical tabs, Ubuntu or openSUSE desktop styling, and search defaults.
          </p>
        </div>

        {/* Tab Layout Section */}
        <section className="rounded-xl bg-white dark:bg-[#1a1d23] border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800">
          <div className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Tab Bar Layout</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Choose between the Vertical Tabs sidebar or traditional top Horizontal Tabs.
              </div>
            </div>
            <div className="flex items-center p-1 rounded-lg bg-neutral-100 dark:bg-[#121418] border border-neutral-200 dark:border-neutral-800">
              {(['vertical', 'horizontal'] as TabLayout[]).map((layout) => (
                <button
                  key={layout}
                  type="button"
                  onClick={() => onUpdateSettings({tabLayout: layout})}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                    settings.tabLayout === layout
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)]'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {layout}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Vertical Sidebar Position</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Dock the vertical tabs rail on the left or right edge of the browser window.
              </div>
            </div>
            <div className="flex items-center p-1 rounded-lg bg-neutral-100 dark:bg-[#121418] border border-neutral-200 dark:border-neutral-800">
              {(['left', 'right'] as SidebarSide[]).map((side) => (
                <button
                  key={side}
                  type="button"
                  onClick={() => onUpdateSettings({sidebarSide: side})}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                    settings.sidebarSide === side
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)]'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {side}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Compact Icon Rail</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Collapse vertical tabs down to 56px icons to maximize web viewport width.
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({verticalTabsCollapsed: !settings.verticalTabsCollapsed})
              }
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                settings.verticalTabsCollapsed
                  ? 'bg-[var(--accent)] text-[var(--accent-contrast)] border-transparent'
                  : 'bg-neutral-100 dark:bg-[#121418] text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-800'
              }`}
            >
              {settings.verticalTabsCollapsed ? 'Compact On' : 'Expanded'}
            </button>
          </div>
        </section>

        {/* Linux Desktop Theme Section */}
        <section className="rounded-xl bg-white dark:bg-[#1a1d23] border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800">
          <div className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Linux Distribution Profile</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Switch between Ubuntu Yaru (orange accent) and openSUSE Chameleon (green accent).
              </div>
            </div>
            <div className="flex items-center p-1 rounded-lg bg-neutral-100 dark:bg-[#121418] border border-neutral-200 dark:border-neutral-800">
              {(['ubuntu', 'opensuse'] as DistroProfile[]).map((distro) => (
                <button
                  key={distro}
                  type="button"
                  onClick={() => onUpdateSettings({distro})}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    settings.distro === distro
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)]'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {distro === 'ubuntu' ? 'Ubuntu' : 'openSUSE'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Color Theme</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Match your GNOME / KDE Plasma desktop light or dark preference.
              </div>
            </div>
            <div className="flex items-center p-1 rounded-lg bg-neutral-100 dark:bg-[#121418] border border-neutral-200 dark:border-neutral-800">
              {(['dark', 'light'] as ThemeMode[]).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => onUpdateSettings({theme})}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                    settings.theme === theme
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)]'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Show Bookmarks Bar</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Display a slim quick-bookmarks strip directly beneath the address bar.
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({showBookmarksBar: !settings.showBookmarksBar})}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                settings.showBookmarksBar
                  ? 'bg-[var(--accent)] text-[var(--accent-contrast)] border-transparent'
                  : 'bg-neutral-100 dark:bg-[#121418] text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-800'
              }`}
            >
              {settings.showBookmarksBar ? 'Visible' : 'Hidden'}
            </button>
          </div>
        </section>

        {/* Search & Reset */}
        <section className="rounded-xl bg-white dark:bg-[#1a1d23] border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800">
          <div className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Default Search Engine</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Used when typing search terms into the address bar or New Tab search field.
              </div>
            </div>
            <select
              value={settings.searchEngine}
              onChange={(e) =>
                onUpdateSettings({searchEngine: e.target.value as SearchEngine})
              }
              className="px-3 py-1.5 text-xs rounded-lg bg-neutral-100 dark:bg-[#121418] border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            >
              <option value="duckduckgo">DuckDuckGo (HTML)</option>
              <option value="wikipedia">Wikipedia</option>
              <option value="startpage">Startpage</option>
              <option value="google">Google</option>
            </select>
          </div>

          <div className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Reset Browser Data</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Restore default settings, bookmarks, and clear local browsing history.
              </div>
            </div>
            <button
              type="button"
              onClick={onResetAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-[#121418] border border-neutral-200 dark:border-neutral-700 hover:border-red-500 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
