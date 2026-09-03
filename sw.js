/**
 * Service worker — doar cât să pornească aplicația fără rețea.
 *
 * **Rețeaua are ultimul cuvânt la pagină.** Prima variantă servea întâi din
 * memorie, iar coaja se împrospăta doar când se schimba fișierul ăsta — care nu
 * se schimba niciodată. Rezultatul: publicai, dar telefonul arăta luni la rând
 * versiunea veche. Acum pagina se cere de la rețea, iar memoria e plasa de
 * siguranță pentru când nu e semnal.
 *
 * `VERSIUNE` e amprenta paginii, pusă de `construieste.py`. Se schimbă doar
 * când se schimbă aplicația — atunci browserul vede alt service worker, îl
 * instalează și aruncă memoria veche. Dacă n-ai schimbat nimic, nici el nu se
 * mișcă.
 *
 * Datele NU se cachează niciodată: sunt de pe alt domeniu (Apps Script) și
 * n-are rost să arate confirmări de ieri.
 */
// `cache: 'reload'` / `'no-cache'` ocolesc cache-ul HTTP al browserului. Fără
// ele, GitHub Pages dă fișierele cu `max-age`, iar service worker-ul nou își
// umple memoria cu pagina expirată — arată versiune nouă de service worker și
// conținut vechi, ceea ce e mai rău decât să nu se fi actualizat deloc.
var VERSIUNE = '2ca40b8e112c';
var CACHE = 'asimilare-' + VERSIUNE;
var COAJA = ['./', './index.html', './manifest.webmanifest', './icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) {
        return c.addAll(COAJA.map(function (u) {
          return new Request(u, { cache: 'reload' });
        }));
      })
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

/** Pagina: rețeaua întâi, memoria doar dacă nu se poate. */
function retiaIntai(cerere) {
  return fetch(new Request(cerere.url, { cache: 'no-cache' })).then(function (proaspat) {
    var copie = proaspat.clone();
    caches.open(CACHE).then(function (c) { c.put(cerere, copie); });
    return proaspat;
  }).catch(function () {
    return caches.match(cerere).then(function (r) { return r || caches.match('./index.html'); });
  });
}

/** Restul cojii: din memorie, dar o împrospătăm în fundal pentru data viitoare. */
function memorieApoiRetea(cerere) {
  return caches.match(cerere).then(function (raspuns) {
    var deLaRetea = fetch(new Request(cerere.url, { cache: 'no-cache' })).then(function (proaspat) {
      var copie = proaspat.clone();
      caches.open(CACHE).then(function (c) { c.put(cerere, copie); });
      return proaspat;
    }).catch(function () { return raspuns; });
    return raspuns || deLaRetea;
  });
}

self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  // Apps Script și fonturile Google trec direct, neatinse.
  if (u.origin !== location.origin || e.request.method !== 'GET') return;

  var estePagina = e.request.mode === 'navigate' ||
                   u.pathname === '/' || /\/(index\.html)?$/.test(u.pathname);
  e.respondWith(estePagina ? retiaIntai(e.request) : memorieApoiRetea(e.request));
});
