import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Key, 
  Lock, 
  Smartphone, 
  Clock, 
  Trash2, 
  Check, 
  Save, 
  Download, 
  Upload, 
  FileText,
  AlertCircle,
  WifiOff,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { VaultSettings, VaultMode, VaultItem } from '../types';
import { encryptData, decryptData } from '../utils/security';
import { syncOfflineCacheWithFeedback } from '../utils/offlineManager';

interface SettingsViewProps {
  mode: VaultMode;
  settings: VaultSettings;
  onUpdateSettings: (newSettings: VaultSettings) => void;
  onLockNow: () => void;
  realItems: VaultItem[];
  fakeItems: VaultItem[];
  onRestoreData?: (real: VaultItem[], fake: VaultItem[]) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  mode,
  settings,
  onUpdateSettings,
  onLockNow,
  realItems,
  fakeItems,
  onRestoreData
}) => {
  const [realPin, setRealPin] = useState(settings.realPin);
  const [duressPin, setDuressPin] = useState(settings.duressPin);
  const [enableFaceId, setEnableFaceId] = useState(settings.enableFaceId);
  const [autoLockMinutes, setAutoLockMinutes] = useState(settings.autoLockMinutes);
  const [stealthTitle, setStealthTitle] = useState(settings.stealthTitle);
  const [saved, setSaved] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; message: string | null; success: boolean }>({
    loading: false,
    message: null,
    success: false
  });

  const handleManualSyncOffline = async () => {
    setSyncStatus({ loading: true, message: 'Đang tải toàn bộ mã nguồn vào bộ nhớ thiết bị...', success: false });
    const result = await syncOfflineCacheWithFeedback();
    setSyncStatus({
      loading: false,
      message: result.message,
      success: result.success
    });
  };

  const isFake = mode === 'fake';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (realPin.length !== 4 || duressPin.length !== 4) {
      alert("Mật khẩu PIN phải bao gồm đúng 4 chữ số.");
      return;
    }
    if (realPin === duressPin) {
      alert("Mật khẩu Không gian Thật và Mật khẩu Giả không được giống nhau!");
      return;
    }

    onUpdateSettings({
      ...settings,
      realPin,
      duressPin,
      enableFaceId,
      autoLockMinutes,
      stealthTitle
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Tính năng Sao lưu ra file .sos được mã hóa AES-256-GCM
  const handleExportBackup = async () => {
    try {
      const backupPayload = JSON.stringify({
        version: "1.0",
        realItems,
        fakeItems,
        exportedAt: new Date().toISOString()
      });
      const encrypted = await encryptData(backupPayload, settings.realPin);
      
      const blob = new Blob([encrypted], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SOS_Backup_${new Date().toISOString().slice(0, 10)}.sos`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Lỗi khi tạo tệp sao lưu.");
    }
  };

  // Tính năng Khôi phục từ file .sos
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const encryptedContent = event.target?.result as string;
        const pinInput = prompt("Vui lòng nhập Mật khẩu Không gian Thật (4 số) để giải mã tệp sao lưu:");
        if (!pinInput) return;

        const decryptedJson = await decryptData(encryptedContent, pinInput);
        const data = JSON.parse(decryptedJson);

        if (data && data.realItems && data.fakeItems && onRestoreData) {
          onRestoreData(data.realItems, data.fakeItems);
          alert("Khôi phục dữ liệu thành công!");
        } else {
          throw new Error("Cấu trúc tệp sao lưu không hợp lệ.");
        }
      } catch (err: any) {
        setRestoreError("Mật khẩu không đúng hoặc tệp sao lưu không hợp lệ.");
        alert("Lỗi khôi phục: " + (err.message || "Mật khẩu không đúng"));
      }
    };
    reader.readAsText(file);
  };

  if (isFake) {
    // CÀI ĐẶT Ở KHÔNG GIAN GIẢ: Hiển thị như ứng dụng ghi chú thường ngày, không có bất kỳ dấu vết bảo mật nào
    return (
      <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-6 select-none">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center justify-center space-x-2">
            <SettingsIcon className="h-5 w-5 text-emerald-400" />
            <span>Cài đặt ứng dụng</span>
          </h2>
          <p className="text-xs text-slate-400">Tùy chỉnh giao diện và ghi chú hằng ngày</p>
        </div>

        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Tên ứng dụng hiển thị
              </label>
              <input
                type="text"
                value={stealthTitle}
                onChange={(e) => setStealthTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Tên này hiển thị trên thanh tiêu đề và màn hình chính.
              </p>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="font-semibold text-sm text-white">Cỡ chữ mặc định</h4>
                <p className="text-xs text-slate-400">Kích thước chữ trong ghi chú</p>
              </div>
              <span className="text-xs text-slate-300">Tiêu chuẩn iOS</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="font-semibold text-sm text-white">Sắp xếp danh sách</h4>
                <p className="text-xs text-slate-400">Thứ tự ưu tiên hiển thị</p>
              </div>
              <span className="text-xs text-slate-300">Mới cập nhật</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-500">Phiên bản 1.0 (iOS Web App)</span>
            <button
              type="button"
              onClick={onLockNow}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl transition-colors active:scale-95"
            >
              Khóa ứng dụng
            </button>
          </div>
        </form>
      </div>
    );
  }

  // CÀI ĐẶT Ở KHÔNG GIAN THẬT: Quản lý bảo mật S.O.S toàn diện
  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-6 select-none">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold text-white flex items-center justify-center space-x-2">
          <Shield className="h-5 w-5 text-emerald-400" />
          <span>Cài đặt bảo mật S.O.S</span>
        </h2>
        <p className="text-xs text-slate-400">
          Quản lý hai không gian và mã hóa dữ liệu cục bộ
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Cài đặt Face ID & Mật khẩu */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 text-emerald-400">
            <Key className="h-5 w-5" />
            <h3 className="font-bold text-sm text-white">Mật khẩu PIN &amp; Sinh trắc học</h3>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
              <label className="text-xs font-semibold text-emerald-400 block">
                Mật khẩu Không gian Thật (4 chữ số)
              </label>
              <input
                type="text"
                maxLength={4}
                required
                value={realPin}
                onChange={(e) => setRealPin(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base text-white font-mono font-bold tracking-widest focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400">
                Dùng để mở khóa không gian lưu trữ dữ liệu quan trọng của bạn.
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-amber-900/50 space-y-1.5">
              <label className="text-xs font-semibold text-amber-400 block">
                Mật khẩu Không gian Giả (4 chữ số)
              </label>
              <input
                type="text"
                maxLength={4}
                required
                value={duressPin}
                onChange={(e) => setDuressPin(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-slate-900 border border-amber-800/60 rounded-xl px-3 py-2 text-base text-amber-300 font-mono font-bold tracking-widest focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-slate-400">
                Khi bị ép mở máy, nhập mật khẩu này sẽ vào ngay không gian ghi chú bình thường mà không để lại nghi ngờ.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-center space-x-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={enableFaceId}
                onChange={(e) => setEnableFaceId(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-white block">Mở khóa bằng Face ID / Touch ID</span>
                <span className="text-[11px] text-slate-400 block">
                  Cho phép mở nhanh vào Không gian Thật bằng sinh trắc học iOS.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Quản lý dữ liệu giả & Tùy chỉnh */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 text-teal-400">
            <FileText className="h-5 w-5" />
            <h3 className="font-bold text-sm text-white">Quản lý không gian giả &amp; Tự khóa</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Tên ứng dụng khi ở Không gian Giả
              </label>
              <input
                type="text"
                value={stealthTitle}
                onChange={(e) => setStealthTitle(e.target.value)}
                placeholder="Ví dụ: Ghi chú hằng ngày"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Tên hiển thị để ngụy trang ứng dụng.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Thời gian tự động khóa
              </label>
              <select
                value={autoLockMinutes}
                onChange={(e) => setAutoLockMinutes(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={1}>1 Phút</option>
                <option value={5}>5 Phút (Mặc định)</option>
                <option value={15}>15 Phút</option>
                <option value={0}>Khóa ngay khi thoát app</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quản lý PWA Offline & Màn hình chính iOS */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-5 space-y-4 shadow-lg shadow-emerald-500/5 relative overflow-hidden">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 text-emerald-400">
            <WifiOff className="h-5 w-5" />
            <h3 className="font-bold text-sm text-white">Chế độ 100% Offline (Màn hình chính iOS)</h3>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
            <p className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Đã khắc phục lỗi "cần có mạng":</strong> Ứng dụng hiện đã được cấu hình <strong>Service Worker &amp; Offline Storage</strong>. Toàn bộ HTML, JS, CSS và hình ảnh được tải thẳng vào bộ nhớ thiết bị.
              </span>
            </p>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 font-sans">
              <span className="text-xs font-bold text-emerald-400 block flex items-center space-x-1.5">
                <Smartphone className="w-4 h-4" />
                <span>Hướng dẫn cài đặt chạy 100% không cần Wi-Fi/4G:</span>
              </span>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-[11px]">
                <li>Mở trang web bằng trình duyệt <strong>Safari</strong> trên iPhone/iPad (khi đang có mạng).</li>
                <li>Bấm nút <strong className="text-emerald-300">"⚡ Đồng bộ Cache Offline ngay"</strong> bên dưới.</li>
                <li>Nhấn nút <strong>Chia sẻ (Share ⬆️)</strong> ở cạnh dưới màn hình Safari.</li>
                <li>Chọn <strong>"Thêm vào Màn hình chính" (Add to Home Screen ➕)</strong>.</li>
                <li>Tắt hoàn toàn Wi-Fi và 4G/5G, sau đó mở ứng dụng S.O.S từ màn hình chính để kiểm tra!</li>
              </ol>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleManualSyncOffline}
              disabled={syncStatus.loading}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-2xl transition-all active:scale-95 shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${syncStatus.loading ? 'animate-spin' : ''}`} />
              <span>{syncStatus.loading ? 'Đang tải mã nguồn...' : '⚡ Đồng bộ Cache Offline ngay'}</span>
            </button>

            {syncStatus.message && (
              <div className={`mt-3 p-3 rounded-xl text-xs font-medium border leading-relaxed flex items-start space-x-2 ${
                syncStatus.success 
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                  : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
              }`}>
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{syncStatus.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sao lưu & Khôi phục */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 text-sky-400">
            <Download className="h-5 w-5" />
            <h3 className="font-bold text-sm text-white">Sao lưu &amp; Khôi phục (AES-256-GCM)</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Dữ liệu của bạn được lưu 100% Offline trên thiết bị. Bạn có thể xuất tệp sao lưu mã hóa `.sos` để lưu trữ an toàn hoặc khôi phục lại khi đổi máy.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 border border-slate-700"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Tải bản sao lưu</span>
            </button>

            <label className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 border border-slate-700 cursor-pointer text-center">
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Khôi phục tệp .sos</span>
              <input
                type="file"
                accept=".sos,.json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Nút Lưu Cài Đặt & Khóa Ngay */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onLockNow}
            className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-3 rounded-2xl text-xs font-bold transition-all border border-slate-700 active:scale-95 text-center"
          >
            Khóa ngay
          </button>

          <button
            type="submit"
            className={`w-1/2 px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 active:scale-95 shadow-md ${
              saved
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {saved ? <Check className="h-4 w-4 stroke-[3]" /> : <Save className="h-4 w-4" />}
            <span>{saved ? 'Đã lưu thay đổi!' : 'Lưu cài đặt'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
