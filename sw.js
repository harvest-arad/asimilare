/**
 * Service worker — doar cât să pornească aplicația fără rețea.
 *
 * Ținem în memorie coaja: pagina, manifestul, iconița. Datele NU se cachează
 * niciodată — sunt de pe alt domeniu (Apps Script) și oricum n-are rost să
 * arate confirmări vechi de ieri. Fără semnal, aplicația pornește și spune
 * cinstit că n-a putut încărca.
 */
var CACHE = 'asimilare-v1';
var COAJA = ['./', './index.html', './manifest.webmanifest', './icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(COAJA); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (chei) {
      return Promise.all(chei.filter(function (k) { return k !== CACHE; })
                             .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  // Apps Script și fonturile Google trec direct, neatinse.
  if (u.origin !== location.origin || e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (raspuns) {
      return raspuns || fetch(e.request).then(function (proaspat) {
        var copie = proaspat.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copie); });
        return proaspat;
      }).catch(function () { return caches.match('./index.html'); });
    })
  );
});
