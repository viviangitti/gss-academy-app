// Service Worker — network first, sem cache de JS/CSS (evita versões travadas)
const CACHE_NAME = 'gss-academy-v172';
const STATIC_CACHE = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  // Assume controle imediatamente sem esperar aba fechar
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Limpa TODOS os caches antigos
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  // JS e CSS: rede primeiro, com CÓPIA de segurança.
  // O nome do arquivo tem hash (index-AbC123.js), então build novo gera nome
  // novo — guardar cópia nunca serve versão velha. Antes não havia plano B: se
  // a rede oscilasse, o JS não carregava e a tela ficava branca.
  if (url.includes('/assets/')) {
    event.respondWith(
      fetch(event.request)
        .then((r) => {
          if (r.ok) {
            const copia = r.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, copia));
          }
          return r;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Sistema de Gestão (/erp-360/), Eleva (/eleva, /pilulas) e APIs internas
  // (/api/): sempre da rede, nunca do cache. Eleva é um app à parte (SPA
  // white-label) e não pode ser servido de cache antigo do coaching.
  if (
    url.includes('/erp-360/') ||
    url.includes('/eleva') ||
    url.includes('/pilulas') ||
    url.includes('/api/')
  ) {
    // Rede primeiro. Se falhar, tenta o que estiver guardado — melhor uma
    // versão de segundos atrás do que a página não abrir. /api/ nunca é
    // guardado (resposta de API não pode ser reaproveitada).
    const ehApi = url.includes('/api/');
    event.respondWith(
      fetch(event.request)
        .then((r) => {
          if (r.ok && !ehApi) {
            const copia = r.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, copia));
          }
          return r;
        })
        .catch(() => {
          if (ehApi) throw new Error('sem rede');
          return caches.match(event.request).then((c) => c || caches.match('/'));
        })
    );
    return;
  }

  // APIs externas: passa direto
  if (
    url.includes('googleapis.com') ||
    url.includes('rss2json.com') ||
    url.includes('news.google.com') ||
    url.includes('firestore') ||
    url.includes('gemini')
  ) return;

  // Resto: network first, fallback para cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match('/'))
      )
  );
});
