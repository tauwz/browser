import {useState} from 'react';
import {Check, Copy, Download, Terminal} from 'lucide-react';
import {
  DESKTOP_ENTRY_CODE,
  INSTALL_SCRIPT_SH,
  NATIVE_PYTHON_GTK4_SOURCE,
  OPENSUSE_INSTALL_CMD,
  UBUNTU_INSTALL_CMD,
} from '../../data/linuxBrowserCode';
import {DistroProfile} from '../../types/browser';

interface LinuxBuildPageProps {
  initialDistro: DistroProfile;
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function LinuxBuildPage({initialDistro}: LinuxBuildPageProps) {
  const [selectedDistro, setSelectedDistro] = useState<DistroProfile>(initialDistro);
  const [activeTab, setActiveTab] = useState<'python' | 'installer' | 'desktop'>('python');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      // Ignore clipboard failures in restricted frames
    }
  };

  const installCmd =
    selectedDistro === 'ubuntu' ? UBUNTU_INSTALL_CMD : OPENSUSE_INSTALL_CMD;

  const codePreview =
    activeTab === 'python'
      ? NATIVE_PYTHON_GTK4_SOURCE
      : activeTab === 'installer'
        ? INSTALL_SCRIPT_SH
        : DESKTOP_ENTRY_CODE;

  const codeFilename =
    activeTab === 'python'
      ? 'tuxpane_browser.py'
      : activeTab === 'installer'
        ? 'install_tuxpane.sh'
        : 'tuxpane-browser.desktop';

  return (
    <div className="h-full overflow-y-auto tux-scroll bg-neutral-50 dark:bg-[#111317] text-neutral-900 dark:text-neutral-100">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Native Linux Browser Source (Ubuntu &amp; openSUSE)
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Run TuxPane natively on Ubuntu 24.04+ or openSUSE Tumbleweed/Leap using Python 3,
              GTK 4, libadwaita, and WebKitGTK 6.0 with built-in vertical tabs and automatic
              distro accent styling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadTextFile('tuxpane_browser.py', NATIVE_PYTHON_GTK4_SOURCE)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-92 transition-opacity whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .py</span>
            </button>
            <button
              type="button"
              onClick={() => downloadTextFile('install_tuxpane.sh', INSTALL_SCRIPT_SH)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-white dark:bg-[#1a1d23] border border-neutral-200 dark:border-neutral-700 hover:border-[var(--accent)] transition-colors whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download install.sh</span>
            </button>
          </div>
        </div>

        {/* Distro Package Installation Panel */}
        <section className="rounded-xl bg-white dark:bg-[#1a1d23] border border-neutral-200 dark:border-neutral-800 p-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Terminal className="w-4 h-4 text-[var(--accent)]" />
              <span>1. Install System Dependencies</span>
            </div>

            <div className="flex items-center p-1 rounded-lg bg-neutral-100 dark:bg-[#121418] border border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setSelectedDistro('ubuntu')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  selectedDistro === 'ubuntu'
                    ? 'bg-[#e95420] text-white'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Ubuntu (apt)
              </button>
              <button
                type="button"
                onClick={() => setSelectedDistro('opensuse')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  selectedDistro === 'opensuse'
                    ? 'bg-[#73ba25] text-[#0b1606]'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                openSUSE (zypper)
              </button>
            </div>
          </div>

          <div className="relative rounded-lg bg-neutral-900 text-neutral-100 p-3.5 font-mono-code text-xs overflow-x-auto">
            <pre className="pr-16 whitespace-pre">{installCmd}</pre>
            <button
              type="button"
              onClick={() => handleCopy('install-cmd', installCmd)}
              className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] cursor-pointer"
            >
              {copiedKey === 'install-cmd' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Launch directly with{' '}
            <code className="font-mono-code px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-[#121418] text-neutral-800 dark:text-neutral-200">
              python3 tuxpane_browser.py
            </code>{' '}
            and toggle Vertical Tabs with{' '}
            <code className="font-mono-code px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-[#121418] text-neutral-800 dark:text-neutral-200">
              Ctrl+Shift+V
            </code>
            .
          </div>
        </section>

        {/* Source Code Viewer */}
        <section className="rounded-xl bg-white dark:bg-[#1a1d23] border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#16181d]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('python')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'python'
                    ? 'bg-white dark:bg-[#252932] text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                tuxpane_browser.py
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('installer')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'installer'
                    ? 'bg-white dark:bg-[#252932] text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                install_tuxpane.sh
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('desktop')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'desktop'
                    ? 'bg-white dark:bg-[#252932] text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                tuxpane-browser.desktop
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy('source-code', codePreview)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-[#252932] border border-neutral-200 dark:border-neutral-700 hover:border-[var(--accent)] transition-colors cursor-pointer"
              >
                {copiedKey === 'source-code' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy {codeFilename}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <pre className="p-4 max-h-[520px] overflow-auto tux-scroll bg-[#0f1115] text-neutral-200 font-mono-code text-xs leading-relaxed">
            <code>{codePreview}</code>
          </pre>
        </section>
      </div>
    </div>
  );
}
