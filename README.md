TuxPane Browser
A Native Linux Web Browser for Ubuntu and openSUSE

TuxPane Browser is a modern Linux desktop web browser built with Python 3, GTK 4, libadwaita, and WebKitGTK 6.0.

It features a customizable vertical tabs sidebar, traditional horizontal tabs, Ubuntu and openSUSE visual themes, private browsing, persistent bookmarks, browsing history, and native Linux source-code export.

1. Key Features
1.1 Vertical and Horizontal Tabs

Switch between two tab layouts using:

Ctrl + Shift + V

Vertical Tabs Sidebar

Dock sidebar on the left or right.
Expandable and collapsible sidebar.
Compact icon-only mode.
Expanded tab list with page titles and icons.
Search and filter open tabs.
Pin and unpin tabs.
Duplicate tabs.
Mute and unmute tabs.
Reorder tabs.
Create private browsing tabs.
Close individual tabs.

Horizontal Tabs

Traditional browser tab strip.
Tab switching and management.
Support for multiple open websites.
Consistent keyboard shortcuts.
1.2 Ubuntu and openSUSE Themes

TuxPane includes two native Linux-inspired appearance profiles.

Ubuntu Theme

Yaru-inspired orange accent.
Ubuntu-inspired typography.
Ubuntu-style controls and highlights.
Light and dark appearance.

openSUSE Theme

Chameleon-inspired green accent.
openSUSE-inspired interface styling.
Green highlights and selection indicators.
Light and dark appearance.

Additional appearance settings:

Toggle dark and light mode.
Change theme without restarting.
Remember the selected theme.
Respect system appearance preferences.
1.3 Live Web Browsing

Use WebKitGTK 6.0 as the native browser rendering engine.

Supported browser operations:

Navigate to public websites.
Back and forward navigation.
Reload and stop loading.
Address bar and URL navigation.
Find-in-page (Ctrl + F).
Multiple browsing tabs.
Private browsing windows or tabs.
Page loading indicators.

Web requests can use the Express proxy endpoint:

/api/proxy

1.4 Built-in Browser Pages

Provide internal browser pages accessible through the address bar.

Internal URL	Description
browse://newtab	New tab dashboard
browse://bookmarks	Saved bookmarks
browse://history	Browsing history
browse://settings	Browser preferences
browse://linux-build	Native Linux source exporter
1.5 Reader Mode

Internal endpoint:

/api/reader

Features:

Extract readable article content.
Remove unnecessary page elements.
Display simplified article layouts.
Improve reading comfort.
Support light and dark reading modes.
1.6 HTTP and HTML Source Inspector

Internal endpoint:

/api/source

Features:

Inspect HTTP responses.
View HTML source.
Inspect response status and headers.
Display page source in a readable format.
1.7 Bookmarks, History and Settings

Store browser information persistently on the local system.

Bookmarks

Add and remove bookmarks.
Organize saved websites.
Open bookmarked pages.

History

Record browsing history.
Display previously visited pages.
Clear browsing history.

Settings

Remember appearance preferences.
Store tab layout preferences.
Remember sidebar position.
Save browser configuration.

Private browsing should avoid retaining private-session history, cookies, and browsing data beyond the session.

2. Native Linux Technology Stack
Component	Technology
Programming language	Python 3
GUI framework	GTK 4
Desktop interface	libadwaita
Browser engine	WebKitGTK 6.0
Styling	GTK CSS
Operating systems	Ubuntu and openSUSE
Backend integration	Express.js
Local storage	SQLite / JSON
Desktop integration	Linux .desktop launcher
Architecture

The application consists of three primary components:

Native desktop frontend: Python 3, GTK 4, and libadwaita.
Web rendering: WebKitGTK 6.0.
Optional backend services: Express proxy, reader mode, and source inspector.

The native browser should remain usable as a standalone application. Backend-dependent features should display a useful error when the Express service is unavailable.

3. Native Linux Source Export

The browse://linux-build page provides an interface for exporting the native browser implementation.

Exportable Files
Filename	Purpose
tuxpane_browser.py	Standalone GTK4/WebKitGTK browser implementation
tuxpane-browser.desktop	Linux desktop launcher
install_tuxpane.sh	Ubuntu and openSUSE installation script
Export Interface

The source exporter should provide:

View Python source code.
Copy source code to clipboard.
Download the Python implementation.
View installation instructions.
Download the desktop launcher.
Download the installation script.
Display supported Linux distributions.

The exported source should be complete and independently usable, rather than containing placeholder code or references to unavailable frontend components.

4. Linux Installation
Ubuntu

Required system packages:

bash
sudo apt update

sudo
