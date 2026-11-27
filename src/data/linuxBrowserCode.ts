export const UBUNTU_INSTALL_CMD = `sudo apt update && sudo apt install -y \\
  python3 python3-gi python3-gi-cairo \\
  gir1.2-gtk-4.0 gir1.2-adw-1 gir1.2-webkit-6.0`;

export const OPENSUSE_INSTALL_CMD = `sudo zypper refresh && sudo zypper install -y \\
  python3 python3-gobject python3-gobject-cairo \\
  typelib-1_0-Gtk-4_0 typelib-1_0-Adw-1 typelib-1_0-WebKit-6_0`;

export const DESKTOP_ENTRY_CODE = `[Desktop Entry]
Name=TuxPane Browser
Comment=Lightweight GTK4 Web Browser with Vertical Tabs for Ubuntu and openSUSE
Exec=python3 /usr/local/bin/tuxpane_browser.py %u
Icon=web-browser
Terminal=false
Type=Application
Categories=Network;WebBrowser;
MimeType=text/html;text/xml;application/xhtml+xml;x-scheme-handler/http;x-scheme-handler/https;
StartupNotify=true`;

export const INSTALL_SCRIPT_SH = `#!/usr/bin/env bash
set -euo pipefail

echo "Detecting Linux distribution..."
if [ -r /etc/os-release ]; then
  . /etc/os-release
else
  echo "Cannot detect distribution (/etc/os-release missing)."
  exit 1
fi

case "\${ID:-}" in
  ubuntu|debian|pop|linuxmint)
    echo "Installing GTK4 + libadwaita + WebKitGTK 6.0 via apt..."
    sudo apt update
    sudo apt install -y python3 python3-gi python3-gi-cairo gir1.2-gtk-4.0 gir1.2-adw-1 gir1.2-webkit-6.0
    ;;
  opensuse-tumbleweed|opensuse-leap|opensuse*|sles)
    echo "Installing GTK4 + libadwaita + WebKitGTK 6.0 via zypper..."
    sudo zypper refresh
    sudo zypper install -y python3 python3-gobject python3-gobject-cairo typelib-1_0-Gtk-4_0 typelib-1_0-Adw-1 typelib-1_0-WebKit-6_0
    ;;
  *)
    echo "Unsupported distro ID '\${ID:-unknown}'. Install GTK4, libadwaita, and WebKitGTK 6.0 manually."
    exit 1
    ;;
esac

sudo install -m 755 tuxpane_browser.py /usr/local/bin/tuxpane_browser.py
mkdir -p ~/.local/share/applications
cat > ~/.local/share/applications/tuxpane-browser.desktop <<'EOF'
${DESKTOP_ENTRY_CODE}
EOF

echo "Installed TuxPane Browser! Launch from your app menu or run: tuxpane_browser.py"
`;

export const NATIVE_PYTHON_GTK4_SOURCE = `#!/usr/bin/env python3
"""
TuxPane Browser — Basic Web Browser for Ubuntu & openSUSE
Stack: Python 3 + GTK 4 + libadwaita + WebKitGTK 6.0
Features:
  - Toggleable Vertical Tabs sidebar (and Horizontal TabBar mode)
  - Auto-detected Ubuntu (Yaru orange) / openSUSE (Chameleon green) accent theme
  - Back, Forward, Reload, Home, Address/Search Omnibox, Pinned Tabs, Bookmarks
"""

import json
import os
import sys
from pathlib import Path
from urllib.parse import quote_plus

import gi

gi.require_version("Gtk", "4.0")
gi.require_version("Adw", "1")
gi.require_version("WebKit", "6.0")

from gi.repository import Adw, Gdk, Gio, GLib, Gtk, WebKit

CONFIG_DIR = Path.home() / ".config" / "tuxpane-browser"
BOOKMARKS_FILE = CONFIG_DIR / "bookmarks.json"
SETTINGS_FILE = CONFIG_DIR / "settings.json"


def detect_distro() -> str:
    """Detect Ubuntu or openSUSE from /etc/os-release."""
    try:
        content = Path("/etc/os-release").read_text(encoding="utf-8").lower()
        if "opensuse" in content or "suse" in content:
            return "opensuse"
    except OSError:
        pass
    return "ubuntu"


DISTRO_ACCENTS = {
    "ubuntu": "#E95420",
    "opensuse": "#73BA25",
}


class BrowserTabData:
    def __init__(self, url: str = "https://duckduckgo.com", pinned: bool = False):
        self.webview = WebKit.WebView()
        self.url = url
        self.title = "New Tab"
        self.pinned = pinned
        settings = self.webview.get_settings()
        settings.set_enable_developer_extras(True)
        settings.set_smooth_scrolling(True)
        self.webview.load_uri(url)


class TuxPaneWindow(Adw.ApplicationWindow):
    def __init__(self, app: Adw.Application, initial_url: str = "https://duckduckgo.com"):
        super().__init__(application=app, title="TuxPane Browser")
        self.set_default_size(1280, 800)

        self.distro = detect_distro()
        self.vertical_tabs_enabled = self._load_vertical_pref()
        self.tabs: list[BrowserTabData] = []
        self.active_tab: BrowserTabData | None = None

        self._apply_distro_css()
        self._build_ui()
        self._register_shortcuts()
        self.add_new_tab(initial_url)

    def _load_vertical_pref(self) -> bool:
        try:
            data = json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
            return bool(data.get("vertical_tabs", True))
        except (OSError, json.JSONDecodeError):
            return True

    def _save_vertical_pref(self):
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        SETTINGS_FILE.write_text(
            json.dumps({"vertical_tabs": self.vertical_tabs_enabled}, indent=2),
            encoding="utf-8",
        )

    def _apply_distro_css(self):
        accent = DISTRO_ACCENTS.get(self.distro, "#E95420")
        css = f"""
        .tux-accent-pill {{
            background-color: {accent};
            color: #ffffff;
            border-radius: 6px;
        }}
        .vertical-tab-row {{
            padding: 6px 10px;
            border-radius: 8px;
        }}
        .vertical-tab-row:selected {{
            background-color: alpha({accent}, 0.22);
        }}
        .url-entry {{
            font-family: monospace;
        }}
        """.encode("utf-8")
        provider = Gtk.CssProvider()
        provider.load_from_data(css)
        Gtk.StyleContext.add_provider_for_display(
            Gdk.Display.get_default(),
            provider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
        )

    def _build_ui(self):
        root_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL)
        self.set_content(root_box)

        # Headerbar with navigation controls + omnibox + vertical tabs toggle
        header = Adw.HeaderBar()
        root_box.append(header)

        nav_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=4)
        self.back_btn = Gtk.Button.new_from_icon_name("go-previous-symbolic")
        self.back_btn.set_tooltip_text("Back (Alt+Left)")
        self.back_btn.connect("clicked", lambda *_: self.active_tab and self.active_tab.webview.go_back())

        self.fwd_btn = Gtk.Button.new_from_icon_name("go-next-symbolic")
        self.fwd_btn.set_tooltip_text("Forward (Alt+Right)")
        self.fwd_btn.connect("clicked", lambda *_: self.active_tab and self.active_tab.webview.go_forward())

        self.reload_btn = Gtk.Button.new_from_icon_name("view-refresh-symbolic")
        self.reload_btn.set_tooltip_text("Reload (Ctrl+R)")
        self.reload_btn.connect("clicked", lambda *_: self.active_tab and self.active_tab.webview.reload())

        nav_box.append(self.back_btn)
        nav_box.append(self.fwd_btn)
        nav_box.append(self.reload_btn)
        header.pack_start(nav_box)

        # Address / Search bar
        self.url_entry = Gtk.Entry()
        self.url_entry.set_hexpand(True)
        self.url_entry.set_placeholder_text("Enter URL or search DuckDuckGo...")
        self.url_entry.add_css_class("url-entry")
        self.url_entry.connect("activate", self._on_url_activate)
        header.set_title_widget(self.url_entry)

        # Right-side controls: New Tab, Vertical Tabs Toggle, Bookmark
        right_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)

        self.vtabs_toggle = Gtk.ToggleButton()
        self.vtabs_toggle.set_icon_name("sidebar-show-symbolic")
        self.vtabs_toggle.set_active(self.vertical_tabs_enabled)
        self.vtabs_toggle.set_tooltip_text("Toggle Vertical Tabs (Ctrl+Shift+V)")
        self.vtabs_toggle.connect("toggled", self._on_toggle_vertical_tabs)

        new_tab_btn = Gtk.Button.new_from_icon_name("tab-new-symbolic")
        new_tab_btn.set_tooltip_text("New Tab (Ctrl+T)")
        new_tab_btn.connect("clicked", lambda *_: self.add_new_tab("https://duckduckgo.com"))

        bookmark_btn = Gtk.Button.new_from_icon_name("bookmark-new-symbolic")
        bookmark_btn.set_tooltip_text("Bookmark Current Page")
        bookmark_btn.connect("clicked", self._on_save_bookmark)

        right_box.append(new_tab_btn)
        right_box.append(bookmark_btn)
        right_box.append(self.vtabs_toggle)
        header.pack_end(right_box)

        # Horizontal Tab Strip (shown only when Vertical Tabs is disabled)
        self.horiz_bar = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=4)
        self.horiz_bar.set_margin_start(8)
        self.horiz_bar.set_margin_end(8)
        self.horiz_bar.set_margin_top(4)
        self.horiz_bar.set_margin_bottom(4)
        self.horiz_bar.set_visible(not self.vertical_tabs_enabled)
        root_box.append(self.horiz_bar)

        # Main split area: Vertical Tab Sidebar + WebView Stack
        self.paned = Gtk.Paned(orientation=Gtk.Orientation.HORIZONTAL)
        self.paned.set_vexpand(True)
        self.paned.set_position(240)
        root_box.append(self.paned)

        # Vertical Tab Sidebar
        self.sidebar_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=6)
        self.sidebar_box.set_size_request(220, -1)
        self.sidebar_box.set_margin_start(8)
        self.sidebar_box.set_margin_end(8)
        self.sidebar_box.set_margin_top(8)
        self.sidebar_box.set_margin_bottom(8)

        sidebar_header = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL)
        sidebar_label = Gtk.Label(label=f"Tabs · {self.distro.upper()}")
        sidebar_label.set_halign(Gtk.Align.START)
        sidebar_label.set_hexpand(True)
        sidebar_add_btn = Gtk.Button.new_from_icon_name("list-add-symbolic")
        sidebar_add_btn.connect("clicked", lambda *_: self.add_new_tab("https://duckduckgo.com"))
        sidebar_header.append(sidebar_label)
        sidebar_header.append(sidebar_add_btn)
        self.sidebar_box.append(sidebar_header)

        scroll = Gtk.ScrolledWindow()
        scroll.set_vexpand(True)
        self.vtab_list = Gtk.ListBox()
        self.vtab_list.set_selection_mode(Gtk.SelectionMode.SINGLE)
        self.vtab_list.connect("row-selected", self._on_vtab_selected)
        scroll.set_child(self.vtab_list)
        self.sidebar_box.append(scroll)

        self.sidebar_box.set_visible(self.vertical_tabs_enabled)
        self.paned.set_start_child(self.sidebar_box)

        # WebView Stack
        self.web_stack = Gtk.Stack()
        self.web_stack.set_hexpand(True)
        self.web_stack.set_vexpand(True)
        self.paned.set_end_child(self.web_stack)

    def _register_shortcuts(self):
        ctrl = Gtk.ShortcutController()
        ctrl.set_scope(Gtk.ShortcutScope.MANAGED)
        shortcuts = [
            ("<Control>t", lambda *_: self.add_new_tab("https://duckduckgo.com")),
            ("<Control>w", lambda *_: self.active_tab and self.close_tab(self.active_tab)),
            ("<Control>r", lambda *_: self.active_tab and self.active_tab.webview.reload()),
            ("<Control>l", lambda *_: self.url_entry.grab_focus()),
            ("<Control><Shift>v", lambda *_: self.vtabs_toggle.set_active(not self.vtabs_toggle.get_active())),
        ]
        for accel, cb in shortcuts:
            ctrl.add_shortcut(
                Gtk.Shortcut.new(
                    Gtk.ShortcutTrigger.parse_string(accel),
                    Gtk.CallbackAction.new(lambda _w, _args, fn=cb: (fn(), True)[1]),
                )
            )
        self.add_controller(ctrl)

    def _normalize_url(self, text: str) -> str:
        raw = text.strip()
        if not raw:
            return "https://duckduckgo.com"
        if raw.startswith(("http://", "https://")):
            return raw
        if " " not in raw and "." in raw:
            return f"https://{raw}"
        return f"https://duckduckgo.com/?q={quote_plus(raw)}"

    def add_new_tab(self, url: str = "https://duckduckgo.com"):
        tab = BrowserTabData(url)
        self.tabs.append(tab)
        self.web_stack.add_child(tab.webview)

        tab.webview.connect("notify::title", lambda wv, _p, t=tab: self._on_tab_meta_changed(t))
        tab.webview.connect("notify::uri", lambda wv, _p, t=tab: self._on_tab_meta_changed(t))

        self._rebuild_tab_strips()
        self.switch_to_tab(tab)

    def close_tab(self, tab: BrowserTabData):
        if len(self.tabs) == 1:
            tab.webview.load_uri("https://duckduckgo.com")
            return
        idx = self.tabs.index(tab)
        self.tabs.remove(tab)
        self.web_stack.remove(tab.webview)
        if self.active_tab is tab:
            next_idx = max(0, idx - 1)
            self.switch_to_tab(self.tabs[next_idx])
        else:
            self._rebuild_tab_strips()

    def switch_to_tab(self, tab: BrowserTabData):
        self.active_tab = tab
        self.web_stack.set_visible_child(tab.webview)
        uri = tab.webview.get_uri() or tab.url
        self.url_entry.set_text(uri)
        self.back_btn.set_sensitive(tab.webview.can_go_back())
        self.fwd_btn.set_sensitive(tab.webview.can_go_forward())
        self._rebuild_tab_strips()

    def _on_tab_meta_changed(self, tab: BrowserTabData):
        tab.title = tab.webview.get_title() or tab.webview.get_uri() or "Untitled"
        tab.url = tab.webview.get_uri() or tab.url
        if tab is self.active_tab:
            self.url_entry.set_text(tab.url)
            self.back_btn.set_sensitive(tab.webview.can_go_back())
            self.fwd_btn.set_sensitive(tab.webview.can_go_forward())
        self._rebuild_tab_strips()

    def _rebuild_tab_strips(self):
        # Clear vertical listbox
        while (child := self.vtab_list.get_first_child()) is not None:
            self.vtab_list.remove(child)
        # Clear horizontal bar
        while (child := self.horiz_bar.get_first_child()) is not None:
            self.horiz_bar.remove(child)

        for idx, tab in enumerate(self.tabs):
            # Vertical tab row
            row = Gtk.ListBoxRow()
            row.add_css_class("vertical-tab-row")
            row_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
            lbl = Gtk.Label(label=tab.title[:28] or "New Tab")
            lbl.set_halign(Gtk.Align.START)
            lbl.set_hexpand(True)
            lbl.set_ellipsize(3)  # PANGO_ELLIPSIZE_END
            close_btn = Gtk.Button.new_from_icon_name("window-close-symbolic")
            close_btn.add_css_class("flat")
            close_btn.connect("clicked", lambda _b, t=tab: self.close_tab(t))
            row_box.append(lbl)
            row_box.append(close_btn)
            row.set_child(row_box)
            self.vtab_list.append(row)
            if tab is self.active_tab:
                self.vtab_list.select_row(row)

            # Horizontal tab button
            htab_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=2)
            htab_btn = Gtk.Button(label=tab.title[:20] or "New Tab")
            if tab is self.active_tab:
                htab_btn.add_css_class("suggested-action")
            htab_btn.connect("clicked", lambda _b, t=tab: self.switch_to_tab(t))
            hclose = Gtk.Button.new_from_icon_name("window-close-symbolic")
            hclose.add_css_class("flat")
            hclose.connect("clicked", lambda _b, t=tab: self.close_tab(t))
            htab_box.append(htab_btn)
            htab_box.append(hclose)
            self.horiz_bar.append(htab_box)

    def _on_vtab_selected(self, _listbox: Gtk.ListBox, row: Gtk.ListBoxRow | None):
        if row is None:
            return
        idx = row.get_index()
        if 0 <= idx < len(self.tabs) and self.tabs[idx] is not self.active_tab:
            self.switch_to_tab(self.tabs[idx])

    def _on_url_activate(self, entry: Gtk.Entry):
        if self.active_tab:
            self.active_tab.webview.load_uri(self._normalize_url(entry.get_text()))

    def _on_toggle_vertical_tabs(self, btn: Gtk.ToggleButton):
        self.vertical_tabs_enabled = btn.get_active()
        self.sidebar_box.set_visible(self.vertical_tabs_enabled)
        self.horiz_bar.set_visible(not self.vertical_tabs_enabled)
        self._save_vertical_pref()

    def _on_save_bookmark(self, _btn: Gtk.Button):
        if not self.active_tab:
            return
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        try:
            bookmarks = json.loads(BOOKMARKS_FILE.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            bookmarks = []
        bookmarks.append({"title": self.active_tab.title, "url": self.active_tab.url})
        BOOKMARKS_FILE.write_text(json.dumps(bookmarks, indent=2), encoding="utf-8")


class TuxPaneApplication(Adw.Application):
    def __init__(self):
        super().__init__(
            application_id="org.tuxpane.Browser",
            flags=Gio.ApplicationFlags.HANDLES_OPEN,
        )

    def do_activate(self):
        win = self.props.active_window
        if not win:
            win = TuxPaneWindow(self)
        win.present()

    def do_open(self, files, _n_files, _hint):
        url = files[0].get_uri() if files else "https://duckduckgo.com"
        win = TuxPaneWindow(self, initial_url=url)
        win.present()


if __name__ == "__main__":
    app = TuxPaneApplication()
    sys.exit(app.run(sys.argv))
`;
