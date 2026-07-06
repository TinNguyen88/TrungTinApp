const CACHE_NAME = 'sos-vault-offline-v2';

// Các tài nguyên tĩnh cốt lõi luôn cần có sẵn
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

// Sự kiện cài đặt Service Worker: Cache ngay các file cốt lõi
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Kích hoạt ngay lập tức
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW S.O.S] Đang lưu cache các file cốt lõi offline...');
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('[SW S.O.S] Một số file cốt lõi chưa sẵn sàng để cache:', err);
      });
    })
  );
});

// Sự kiện kích hoạt: Dọn dẹp cache cũ và tiếp quản ngay các trang đang mở
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('sos-vault-')) {
            console.log('[SW S.O.S] Xóa cache cũ:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Sự kiện Fetch: Xử lý khi ứng dụng tải tài nguyên (đặc biệt khi mở từ Màn hình chính iOS)
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Chỉ xử lý các yêu cầu GET qua HTTP/HTTPS
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Xử lý yêu cầu điều hướng (Navigation - Mở trang web hoặc tải lại từ Màn hình chính iOS)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
        // Nếu tìm thấy trong cache, trả về ngay lập tức để mở app siêu tốc khi Offline
        if (cachedResponse) {
          // Cập nhật ngầm trong nền nếu đang có mạng (Stale-while-revalidate)
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
              }
            })
            .catch(() => {
              // Đang offline, bỏ qua lỗi network
            });
          return cachedResponse;
        }

        // Nếu chưa có trong cache, tải từ mạng và lưu vào cache
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
            }
            return networkResponse;
          })
          .catch(async () => {
            // Khi Offline mà không tìm thấy chính xác url, thử tìm file ./index.html hoặc ./ trong cache
            const fallbackHtml = await caches.match('./index.html') || await caches.match('./');
            if (fallbackHtml) {
              return fallbackHtml;
            }
            return new Response(
              '<html><body style="background:#020617;color:#fff;font-family:sans-serif;text-align:center;padding:50px;"><h2>S.O.S Offline</h2><p>Vui lòng kết nối mạng một lần đầu tiên để đồng bộ bộ nhớ offline cho màn hình chính.</p></body></html>',
              { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            );
          });
      })
    );
    return;
  }

  // 2. Xử lý các tài nguyên tĩnh (.js, .css, .svg, .png, .woff2, .json...)
  // Chiến lược Cache-First: Ưu tiên lấy từ cache để hoạt động 100% offline
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Nếu chưa có trong cache, tải từ mạng rồi lưu ngay vào cache
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Trả về lỗi im lặng hoặc rỗng khi không tải được tài nguyên phụ
          return new Response('', { status: 408, statusText: 'Offline Resource Not Available' });
        });
    })
  );
});

// Lắng nghe lệnh từ trang chủ (ví dụ: yêu cầu cache thủ công toàn bộ DOM)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_ALL_ASSETS') {
    const urls = event.data.urls || [];
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW S.O.S] Đang đồng bộ thủ công vào cache offline:', urls.length, 'file');
      urls.forEach((url) => {
        fetch(url, { cache: 'reload' })
          .then((res) => {
            if (res && res.status === 200) {
              cache.put(url, res);
            }
          })
          .catch(() => {});
      });
    });
  }
});
