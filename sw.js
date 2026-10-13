// Ley Food: ilova internetsiz ham ochilishi uchun
var C = "leyfood-v1";
var FILES = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(C).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.filter(function (x) { return x !== C; }).map(function (x) { return caches.delete(x); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== "GET") return;
  if (u.origin === location.origin) {
    // yangi versiyani olishga harakat, internet bo'lmasa saqlanganini ochish
    e.respondWith(fetch(r).then(function (res) {
      var cp = res.clone(); caches.open(C).then(function (c) { c.put(r, cp); }); return res;
    }).catch(function () { return caches.match(r).then(function (m) { return m || caches.match("index.html"); }); }));
  } else if (u.hostname === "www.gstatic.com") {
    // Firebase kutubxonalari: bir marta yuklab, saqlab qo'yish
    e.respondWith(caches.match(r).then(function (m) {
      return m || fetch(r).then(function (res) { var cp = res.clone(); caches.open(C).then(function (c) { c.put(r, cp); }); return res; });
    }));
  }
});
