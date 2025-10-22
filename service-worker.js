// service-worker.js
const TARGET_SUBSTRING = "/shadowpasser/version";
const MATCH_TEXT = "1.1.9";
const REPLACEMENT_TEXT = "true";
const REPLACEMENT_CONTENT_TYPE = "text/plain;charset=UTF-8";

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = req.url;

  event.respondWith((async () => {
    try {
      const originalResponse = await fetch(req);
      if (!url.includes(TARGET_SUBSTRING)) return originalResponse;

      const resp = originalResponse.clone();
      const text = await resp.text();

      if (text !== null && text !== undefined && text.trim().toLowerCase() === MATCH_TEXT.toLowerCase()) {
        const headers = new Headers(resp.headers);
        headers.set('content-type', REPLACEMENT_CONTENT_TYPE);
        headers.delete('content-encoding');
        headers.delete('transfer-encoding');

        return new Response(REPLACEMENT_TEXT, {
          status: resp.status,
          statusText: resp.statusText,
          headers
        });
      }

      return originalResponse;
    } catch (err) {
      try { 
        return await fetch(req); 
      } catch (_) {
        return new Response('Service Worker fetch error', { status: 502 });
      }
    }
  })());
});