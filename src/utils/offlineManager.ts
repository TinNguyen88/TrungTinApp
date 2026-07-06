/**
 * Trình quản lý chế độ Offline cho ứng dụng S.O.S
 * Đảm bảo khi người dùng thêm vào màn hình chính (Add to Home Screen trên iOS Safari / Android),
 * toàn bộ mã nguồn JS, CSS, hình ảnh đều có sẵn trong Cache Storage mà không cần internet.
 */

export function registerOfflineServiceWorker(): void {
  if ('serviceWorker' in navigator && typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      // Sử dụng đường dẫn tương đối để tương thích mọi subfolder / custom domain
      navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
          console.log('[S.O.S Offline] Service Worker đã đăng ký thành công:', registration.scope);
          // Tự động đồng bộ cache ngay sau khi tải trang 3 giây
          setTimeout(() => {
            syncOfflineCacheQuietly();
          }, 3000);
        })
        .catch((error) => {
          console.error('[S.O.S Offline] Lỗi đăng ký Service Worker:', error);
        });
    });
  }
}

// Đồng bộ thầm lặng trong nền không cần thông báo
export async function syncOfflineCacheQuietly(): Promise<boolean> {
  if (!('caches' in window)) return false;

  try {
    const cacheName = 'sos-vault-offline-v2';
    const cache = await caches.open(cacheName);

    // Lấy tất cả tài nguyên đang hiển thị / kết nối trong trang
    const urlsToCache: string[] = [
      './',
      './index.html',
      './manifest.json',
      './icon.svg',
      window.location.href.split('#')[0]
    ];

    // Tìm tất cả các file js, css, hình ảnh trong DOM
    document.querySelectorAll('script[src], link[href], img[src]').forEach((el) => {
      const src = (el as HTMLScriptElement).src || (el as HTMLLinkElement).href || (el as HTMLImageElement).src;
      if (src && src.startsWith(window.location.origin)) {
        urlsToCache.push(src);
      }
    });

    // Xóa trùng lặp
    const uniqueUrls = Array.from(new Set(urlsToCache));

    // Gửi lệnh cho Service Worker nếu đang chạy
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_ALL_ASSETS',
        urls: uniqueUrls
      });
    }

    // Đồng thời lưu trực tiếp từ client vào Cache Storage
    await Promise.all(
      uniqueUrls.map(async (url) => {
        try {
          const res = await fetch(url, { cache: 'reload' });
          if (res && res.status === 200) {
            await cache.put(url, res);
          }
        } catch {
          // Bỏ qua lỗi nếu offline
        }
      })
    );

    console.log('[S.O.S Offline] Đã đồng bộ hoàn tất:', uniqueUrls.length, 'tài nguyên.');
    return true;
  } catch (error) {
    console.error('[S.O.S Offline] Lỗi đồng bộ cache:', error);
    return false;
  }
}

// Đồng bộ thủ công khi người dùng bấm nút trong Cài đặt (có trả về kết quả)
export async function syncOfflineCacheWithFeedback(): Promise<{ success: boolean; count: number; message: string }> {
  if (!('caches' in window)) {
    return { success: false, count: 0, message: 'Trình duyệt không hỗ trợ Cache Storage offline.' };
  }

  try {
    const cacheName = 'sos-vault-offline-v2';
    const cache = await caches.open(cacheName);

    const urlsToCache: string[] = [
      './',
      './index.html',
      './manifest.json',
      './icon.svg',
      window.location.href.split('#')[0]
    ];

    document.querySelectorAll('script[src], link[href], img[src]').forEach((el) => {
      const src = (el as HTMLScriptElement).src || (el as HTMLLinkElement).href || (el as HTMLImageElement).src;
      if (src && src.startsWith(window.location.origin)) {
        urlsToCache.push(src);
      }
    });

    const uniqueUrls = Array.from(new Set(urlsToCache));
    let successCount = 0;

    for (const url of uniqueUrls) {
      try {
        const res = await fetch(url, { cache: 'reload' });
        if (res && res.status === 200) {
          await cache.put(url, res);
          successCount++;
        }
      } catch {
        // Kiểm tra xem đã có trong cache chưa
        const existing = await cache.match(url);
        if (existing) successCount++;
      }
    }

    // Gửi lệnh cho SW
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_ALL_ASSETS',
        urls: uniqueUrls
      });
    }

    return {
      success: true,
      count: successCount,
      message: `Đã lưu an toàn ${successCount} file mã nguồn vào bộ nhớ thiết bị! Ứng dụng sẵn sàng mở từ Màn hình chính khi không có mạng.`
    };
  } catch (error: any) {
    return {
      success: false,
      count: 0,
      message: 'Có lỗi xảy ra khi đồng bộ offline: ' + (error?.message || 'Lỗi không xác định')
    };
  }
}
