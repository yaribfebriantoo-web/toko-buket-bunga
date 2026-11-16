"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Flower2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Cek jika sudah berjalan sebagai aplikasi terinstal
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Deteksi perangkat iPhone / iPad
    const ua = window.navigator.userAgent;
    const iosDevice = /iPad|iPhone|iPod/.test(ua);
    setIsIOS(iosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Munculkan tombol saat halaman di-scroll ke bawah (> 250px)
    const handleScroll = () => {
      if (window.scrollY > 250 && !isDismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isDismissed]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      alert("Untuk menginstal: ketuk menu titik tiga (⋮) di pojok kanan atas browser, lalu pilih 'Tambahkan ke layar utama / Install app'.");
    }
  };

  if (!showBanner || isDismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-emerald-950/80 backdrop-blur-md border border-emerald-700/40 shadow-lg rounded-full px-3.5 py-2 text-white max-w-[260px] sm:max-w-xs transition-all">
      <div className="bg-emerald-950 text-white px-4 py-3.5 rounded-2xl shadow-2xl border border-emerald-800 max-w-md w-full flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-200 flex items-center justify-center shrink-0">
              <Flower2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Install JESMA Bouquet</p>
              <p className="text-xs text-emerald-200 mt-0.5">Akses katalog lebih cepat dari layar utama</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleInstallClick}
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 text-emerald-300 hover:text-white rounded-lg"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showIOSGuide && (
          <div className="text-xs bg-emerald-900/90 p-2.5 rounded-xl text-emerald-100 border border-emerald-700 mt-1">
            Pengguna iPhone/iPad: Ketuk ikon <b>Share (Bagikan)</b> di bagian bawah Safari, lalu pilih <b>Add to Home Screen (Tambah ke Layar Utama)</b>.
          </div>
        )}
      </div>
    </div>
  );
}
