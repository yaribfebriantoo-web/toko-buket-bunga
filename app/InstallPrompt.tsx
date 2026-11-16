"use client";

import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleScroll = () => {
      if (window.scrollY > 250 && !isDismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isDismissed]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsVisible(false);
      }
    } else {
      alert(
        "Cara Instal Aplikasi JESMA Bouquet:\n\n• Android (Chrome): Ketuk ikon titik tiga (⋮) di pojok kanan atas, lalu pilih 'Instal aplikasi' atau 'Tambahkan ke layar utama'.\n• iPhone (Safari): Ketuk ikon Share (kotak panah ke atas), lalu pilih 'Add to Home Screen'."
      );
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-emerald-950/75 backdrop-blur-md border border-white/25 shadow-lg rounded-full pl-3.5 pr-2 py-2 text-white transition-all">
      <button
        onClick={handleInstall}
        className="flex items-center gap-1.5 text-xs font-medium tracking-tight whitespace-nowrap cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-amber-300 shrink-0" />
        <span>Install Aplikasi JESMA Bouquet di HP</span>
      </button>

      <button
        onClick={() => {
          setIsDismissed(true);
          setIsVisible(false);
        }}
        aria-label="Tutup"
        className="p-1 rounded-full hover:bg-white/15 text-white/70 hover:text-white transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
