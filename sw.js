/* Service worker بسيط: يخزّن غلاف التطبيق فقط، ولا يتدخل في Firebase أو الفيديو */
const V = "rf-v2", SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "teacher.jpg"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  /* فتح فوري من الكاش + تحديث في الخلفية (stale-while-revalidate) */
  e.respondWith(caches.match(r).then(m => { const net = fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; }).catch(() => m || caches.match("index.html")); return m || net; }));
});
