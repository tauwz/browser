import express, {Request, Response} from 'express';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 TuxPane/1.0';

function isPrivateOrBlockedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === 'localhost' ||
    lower === '0.0.0.0' ||
    lower === '::1' ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal')
  ) {
    return true;
  }

  const ipVersion = net.isIP(lower);
  if (ipVersion === 4) {
    const parts = lower.split('.').map(Number);
    if (parts.length !== 4) return true;
    const [a, b] = parts;
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
  } else if (ipVersion === 6) {
    if (
      lower === '::1' ||
      lower.startsWith('fc') ||
      lower.startsWith('fd') ||
      lower.startsWith('fe80')
    ) {
      return true;
    }
  }
  return false;
}

function validateExternalUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    if (!parsed.hostname || isPrivateOrBlockedHost(parsed.hostname)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripTagsToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function injectBrowserBridge(html: string, finalUrl: string, tabId: string): string {
  const safeUrl = JSON.stringify(finalUrl);
  const safeTabId = JSON.stringify(tabId);
  const baseTag = `<base href="${escapeHtml(finalUrl)}" target="_self">`;

  const bridgeScript = `
<script>
(function() {
  var CURRENT_URL = ${safeUrl};
  var TAB_ID = ${safeTabId};

  function postMeta() {
    var iconEl = document.querySelector('link[rel~="icon"], link[rel="shortcut icon"]');
    var favicon = iconEl ? iconEl.href : '';
    try {
      window.parent.postMessage({
        type: 'tuxpane-meta',
        tabId: TAB_ID,
        url: CURRENT_URL,
        title: document.title || CURRENT_URL,
        favicon: favicon
      }, '*');
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', postMeta);
  } else {
    postMeta();
  }
  window.addEventListener('load', postMeta);

  document.addEventListener('click', function(e) {
    var el = e.target;
    while (el && el.tagName !== 'A') {
      el = el.parentElement;
    }
    if (!el || !el.getAttribute) return;
    var href = el.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) return;
    try {
      var resolved = new URL(href, CURRENT_URL).href;
      if (resolved.startsWith('http://') || resolved.startsWith('https://')) {
        e.preventDefault();
        window.parent.postMessage({
          type: 'tuxpane-navigate',
          tabId: TAB_ID,
          url: resolved,
          newTab: e.ctrlKey || e.metaKey || el.getAttribute('target') === '_blank'
        }, '*');
      }
    } catch (err) {}
  }, true);

  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (!form || form.tagName !== 'FORM') return;
    var method = (form.getAttribute('method') || 'GET').toUpperCase();
    if (method !== 'GET') return;
    try {
      var action = form.getAttribute('action') || CURRENT_URL;
      var targetUrl = new URL(action, CURRENT_URL);
      var formData = new FormData(form);
      formData.forEach(function(val, key) {
        if (typeof val === 'string') {
          targetUrl.searchParams.set(key, val);
        }
      });
      e.preventDefault();
      window.parent.postMessage({
        type: 'tuxpane-navigate',
        tabId: TAB_ID,
        url: targetUrl.href,
        newTab: false
      }, '*');
    } catch (err) {}
  }, true);

  window.addEventListener('message', function(e) {
    if (!e.data || e.data.type !== 'tuxpane-find') return;
    var q = (e.data.query || '').trim();
    if (!q) {
      if (window.getSelection) window.getSelection().removeAllRanges();
      return;
    }
    if (window.find) {
      window.find(q, false, !!e.data.backwards, true, false, false, false);
    }
  });
})();
</script>`;

  // Strip Content-Security-Policy meta tags that block inline scripts or framing
  let cleaned = html.replace(
    /<meta[^>]+http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi,
    ''
  );

  if (/<head[^>]*>/i.test(cleaned)) {
    cleaned = cleaned.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);
  } else {
    cleaned = `${baseTag}${cleaned}`;
  }

  if (/<\/body>/i.test(cleaned)) {
    cleaned = cleaned.replace(/<\/body>/i, `${bridgeScript}</body>`);
  } else {
    cleaned = `${cleaned}${bridgeScript}`;
  }

  return cleaned;
}

function buildErrorHtml(url: string, reason: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Unable to Load Page</title>
  <style>
    body {
      margin: 0;
      padding: 48px 24px;
      font-family: system-ui, -apple-system, sans-serif;
      background: #141619;
      color: #e6e9ef;
      display: flex;
      justify-content: center;
    }
    .panel {
      max-width: 560px;
      width: 100%;
      background: #1d2025;
      border: 1px solid #2e333b;
      border-radius: 12px;
      padding: 28px;
    }
    h1 { margin: 0 0 8px; font-size: 20px; font-weight: 600; }
    p { margin: 0 0 16px; color: #9aa3b2; font-size: 14px; line-height: 1.55; }
    code {
      display: block;
      padding: 10px 12px;
      background: #121417;
      border: 1px solid #2a2f37;
      border-radius: 8px;
      color: #d6dde8;
      font-family: ui-monospace, monospace;
      font-size: 12px;
      word-break: break-all;
      margin-bottom: 16px;
    }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; }
    a, button {
      appearance: none;
      border: 1px solid #383e47;
      background: #262a31;
      color: #f0f3f7;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
    }
    button.primary {
      background: #e95420;
      border-color: #e95420;
      color: #ffffff;
    }
  </style>
</head>
<body>
  <div class="panel">
    <h1>This site could not be loaded via proxy</h1>
    <p>${escapeHtml(reason)}</p>
    <code>${escapeHtml(url)}</code>
    <div class="actions">
      <button class="primary" onclick="location.reload()">Try Again</button>
      <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Open in Host Browser</a>
    </div>
  </div>
</body>
</html>`;
}

async function createServer() {
  const app = express();

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ok: true, service: 'tuxpane-browser'});
  });

  app.get('/api/proxy', async (req: Request, res: Response) => {
    const rawUrl = String(req.query.url || '');
    const tabId = String(req.query.tabId || '');
    const parsed = validateExternalUrl(rawUrl);

    if (!parsed) {
      res
        .status(400)
        .type('html')
        .send(buildErrorHtml(rawUrl, 'Invalid or disallowed URL. Only public http:// and https:// addresses are permitted.'));
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const upstream = await fetch(parsed.href, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const finalUrl = upstream.url || parsed.href;
      const contentType = upstream.headers.get('content-type') || 'text/html; charset=utf-8';

      res.setHeader('X-TuxPane-Final-Url', finalUrl);
      res.setHeader('Cache-Control', 'no-store');

      if (contentType.includes('text/html') || contentType.includes('application/xhtml+xml')) {
        const html = await upstream.text();
        const rewritten = injectBrowserBridge(html, finalUrl, tabId);
        res.status(upstream.status >= 400 ? 200 : upstream.status).type('html').send(rewritten);
        return;
      }

      if (contentType.startsWith('text/') || contentType.includes('json') || contentType.includes('xml')) {
        const text = await upstream.text();
        res.status(upstream.status).type(contentType).send(text);
        return;
      }

      const arrayBuffer = await upstream.arrayBuffer();
      res.status(upstream.status).type(contentType).send(Buffer.from(arrayBuffer));
    } catch (err) {
      clearTimeout(timeout);
      const message = err instanceof Error ? err.message : 'Network request failed';
      res.status(200).type('html').send(buildErrorHtml(parsed.href, `Connection failed: ${message}`));
    }
  });

  app.get('/api/reader', async (req: Request, res: Response) => {
    const rawUrl = String(req.query.url || '');
    const parsed = validateExternalUrl(rawUrl);
    if (!parsed) {
      res.status(400).json({error: 'Invalid or disallowed URL.'});
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const upstream = await fetch(parsed.href, {
        headers: {'User-Agent': USER_AGENT, Accept: 'text/html,*/*;q=0.8'},
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const html = await upstream.text();
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const title = titleMatch ? stripTagsToText(titleMatch[1]) : parsed.hostname;

      const mainMatch =
        html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
        html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
        html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

      const scope = mainMatch ? mainMatch[1] : html;
      const blocks: Array<{tag: 'h1' | 'h2' | 'p' | 'li'; text: string}> = [];
      const blockRegex = /<(h1|h2|h3|p|li)[^>]*>([\s\S]*?)<\/\1>/gi;
      let match: RegExpExecArray | null;
      while ((match = blockRegex.exec(scope)) !== null) {
        const tagRaw = match[1].toLowerCase();
        const text = stripTagsToText(match[2]);
        if (text.length < (tagRaw === 'p' ? 28 : 4)) continue;
        const tag = tagRaw === 'h1' ? 'h1' : tagRaw === 'h2' || tagRaw === 'h3' ? 'h2' : tagRaw === 'li' ? 'li' : 'p';
        blocks.push({tag, text});
        if (blocks.length >= 120) break;
      }

      res.json({
        url: upstream.url || parsed.href,
        hostname: parsed.hostname,
        title,
        blocks,
      });
    } catch (err) {
      clearTimeout(timeout);
      res.status(502).json({
        error: err instanceof Error ? err.message : 'Unable to extract reader view.',
      });
    }
  });

  app.get('/api/source', async (req: Request, res: Response) => {
    const rawUrl = String(req.query.url || '');
    const parsed = validateExternalUrl(rawUrl);
    if (!parsed) {
      res.status(400).json({error: 'Invalid or disallowed URL.'});
      return;
    }

    const startedAt = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const upstream = await fetch(parsed.href, {
        headers: {'User-Agent': USER_AGENT},
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const elapsedMs = Date.now() - startedAt;
      const body = await upstream.text();
      const headers: Record<string, string> = {};
      upstream.headers.forEach((value, key) => {
        headers[key] = value;
      });

      res.json({
        url: upstream.url || parsed.href,
        status: upstream.status,
        statusText: upstream.statusText,
        elapsedMs,
        bytes: Buffer.byteLength(body, 'utf8'),
        headers,
        source: body.slice(0, 120000),
      });
    } catch (err) {
      clearTimeout(timeout);
      res.status(502).json({
        error: err instanceof Error ? err.message : 'Failed to inspect page source.',
      });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {middlewareMode: true},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TuxPane Browser server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
