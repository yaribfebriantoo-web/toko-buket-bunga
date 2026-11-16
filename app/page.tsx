"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { ShoppingBag, Plus, X, Send, Flower2, Lock, Sparkles, Heart, Award, Edit3, MessageCircle } from "lucide-react";
import Link from "next/link";

interface Produk {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  deskripsi: string;
  gambar_url: string;
  status: string; // "Tersedia" atau "Sold Out"
}

interface BannerIklan {
  id: number;
  gambar_url: string;
  judul?: string;
}

interface CartItem extends Produk {
  qty: number;
}

export default function JesmaBouquetHome() {
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [bannerList, setBannerList] = useState<BannerIklan[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  const [loading, setLoading] = useState(true);
  const [kategoriAktif, setKategoriAktif] = useState("Semua");

  const [logoUrl, setLogoUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com");
  const [whatsappNo, setWhatsappNo] = useState("6281234567890");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [namaPemesan, setNamaPemesan] = useState("");
  const [alamat, setAlamat] = useState("");
  const [ucapan, setUcapan] = useState("");

  // State untuk Pop-up Detail Produk
  const [selectedProduct, setSelectedProduct] = useState<Produk | null>(null);

  // State untuk Custom Order via WhatsApp
  const [customNama, setCustomNama] = useState("");
  const [customDetail, setCustomDetail] = useState("");
  const [customBudget, setCustomBudget] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: dataProduk } = await supabase
        .from("produk_buket")
        .select("*")
        .order("id", { ascending: false });

      if (dataProduk) setProdukList(dataProduk);

      const { data: dataBanner } = await supabase
        .from("banner_iklan")
        .select("*")
        .order("id", { ascending: false });

      if (dataBanner) setBannerList(dataBanner);

      const { data: dataSetting } = await supabase
        .from("pengaturan_toko")
        .select("*")
        .eq("id", 1)
        .single();

      if (dataSetting) {
        if (dataSetting.instagram_url) setInstagramUrl(dataSetting.instagram_url);
        if (dataSetting.whatsapp_no) setWhatsappNo(dataSetting.whatsapp_no);
        if (dataSetting.logo_url) setLogoUrl(dataSetting.logo_url);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Efek Slideshow untuk Bingkai Koleksi Jesma / Banner Iklan
  useEffect(() => {
    if (bannerList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [bannerList.length]);

  const addToCart = (item: Produk) => {
    if (item.status === "Sold Out") {
      alert("Maaf, produk ini sedang Sold Out.");
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const totalHarga = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);
  const totalItem = cart.reduce((sum, item) => sum + item.qty, 0);

  const checkoutWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    let pesan = `Halo *JESMA Bouquet*, saya ingin memesan:\n\n`;
    cart.forEach((item, idx) => {
      pesan += `${idx + 1}. *${item.nama}* (${item.qty}x) - Rp ${(item.harga * item.qty).toLocaleString("id-ID")}\n`;
    });
    pesan += `\n*Total: Rp ${totalHarga.toLocaleString("id-ID")}*\n`;
    pesan += `\n*Data Pemesan:*\nNama: ${namaPemesan}\nAlamat: ${alamat}\nIsi Kartu Ucapan: ${ucapan || "-"}\n\nMohon info ketersediaannya ya, terima kasih!`;

    const url = `https://wa.me/${whatsappNo}?text=${encodeURIComponent(pesan)}`;
    window.open(url, "_blank");
  };

  const handleCustomOrderWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    let pesan = `Halo *JESMA Bouquet*, saya ingin memesan buket custom dengan detail berikut:\n\n`;
    pesan += `*Nama:* ${customNama}\n`;
    pesan += `*Detail/Tema Custom:* ${customDetail}\n`;
    pesan += `*Estimasi Budget:* Rp ${Number(customBudget).toLocaleString("id-ID")}\n\n`;
    pesan += `Mohon bantuannya untuk konfirmasi ketersediaan dan harganya, terima kasih!`;

    const url = `https://wa.me/${whatsappNo}?text=${encodeURIComponent(pesan)}`;
    window.open(url, "_blank");
  };

  const kategoriList = ["Semua", "Romantis", "Wisuda", "Ulang Tahun", "Pernikahan"];
  const produkTersaring =
    kategoriAktif === "Semua"
      ? produkList
      : produkList.filter((p) => p.kategori === kategoriAktif);

  return (
    <div id="beranda" className="min-h-screen bg-[#FAF7F2] text-stone-800 font-sans">
      {/* Tambahan style lokal untuk animasi kilau (flash/shimmer) & kontrol batasan zoom */}
      <style jsx global>{`
        @keyframes shine {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-flash-shine {
          background: linear-gradient(90deg, #1c1917 0%, #1c1917 40%, #d4af37 50%, #1c1917 60%, #1c1917 100%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shine 4s linear infinite;
        }
        /* Mencegah zoom-out berlebih di perangkat mobile namun tetap izinkan zoom-in */
        html {
          touch-action: manipulation;
          text-size-adjust: 100%;
        }
      `}</style>

      {/* Navbar Profesional */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 px-4 md:px-6 py-4 shadow-xs">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          {/* Logo & Nama Merek */}
          <Link href="#beranda" className="flex items-center gap-2.5 group">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover shadow-sm group-hover:scale-105 transition" />
            ) : (
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-emerald-900 text-amber-200 flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                <Flower2 className="w-5 h-5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-serif font-bold tracking-wide text-stone-900 leading-none">
                JESMA <span className="text-emerald-800 font-normal">Bouquet</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400 mt-1">
                Melayani via Online
              </span>
            </div>
          </Link>

          {/* Menu Navigasi */}
          <div className="flex items-center gap-3 md:gap-7">
            <a href="#beranda" className="hidden sm:inline text-sm font-medium text-stone-700 hover:text-emerald-800 transition">Beranda</a>
            <a href="#katalog" className="hidden sm:inline text-sm font-medium text-stone-700 hover:text-emerald-800 transition">Koleksi</a>
            <a href="#custom-order" className="hidden sm:inline text-sm font-medium text-stone-700 hover:text-emerald-800 transition">Custom Order</a>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Kunjungi Instagram"
              className="p-2 rounded-full text-stone-600 hover:text-pink-600 hover:bg-pink-50 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>

            <Link
              href="/admin"
              className="text-xs md:text-sm font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1 border border-stone-200 px-2.5 py-1.5 rounded-full hover:bg-stone-50 transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Admin</span>
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-emerald-900 hover:bg-emerald-950 text-white px-3.5 py-2 rounded-full flex items-center gap-2 text-xs md:text-sm font-medium shadow-sm transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Keranjangmu</span>
              {totalItem > 0 && (
                <span className="bg-amber-400 text-stone-950 text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {totalItem}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section & Bingkai Koleksi Jesma (Slideshow Banner Iklan) */}
      <header className="max-w-6xl mx-auto px-6 py-10 md:py-16 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 bg-emerald-900/10 text-emerald-900 text-xs font-semibold px-3.5 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Crafted with Precision and Care</span>
          </div>
          {/* Judul dengan Efek Flash / Shimmer Emas & Font Serif Premium */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold tracking-tight leading-tight animate-flash-shine">
            Rangkaian Bunga untuk Setiap Momen Berhargamu
          </h1>
          <p className="text-stone-600 text-sm md:text-lg leading-relaxed">
            JESMA Bouquet menghadirkan karya seni merangkai bunga Artifisial dengan sentuhan estetika untuk Moment Wisuda, Perayaan Cinta, dan Hadiah Istimewa kustomisasi sesuai keinginanmu.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="#katalog"
              className="bg-emerald-900 hover:bg-emerald-950 text-white text-sm md:text-base font-medium px-6 py-3 md:px-7 md:py-3.5 rounded-full shadow-md transition"
            >
              Jelajahi Katalog
            </a>
            <a
              href="#custom-order"
              className="bg-white hover:bg-stone-50 text-stone-800 text-sm md:text-base border border-stone-300 font-medium px-5 py-3 md:px-6 md:py-3.5 rounded-full flex items-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-800" />
              <span>Custom Order WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Bingkai Koleksi Jesma - Slideshow Banner Iklan */}
        <div className="relative">
          <div className="h-72 sm:h-80 md:h-[420px] rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-stone-100 relative">
            {bannerList.length > 0 ? (
              bannerList.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentBanner ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <img
                    src={banner.gambar_url}
                    alt={banner.judul || "Bingkai Koleksi Jesma"}
                    className="w-full h-full object-contain bg-[#FAF7F2]"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                    <p className="text-xs md:text-sm font-bold">{banner.judul || "Iklan & Koleksi Spesial"}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-6 text-center">
                <Flower2 className="w-12 h-12 mb-2 opacity-40" />
                <p className="text-sm font-medium">Belum ada foto iklan/banner diunggah oleh Admin.</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Keunggulan Singkat */}
      <section className="max-w-6xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-2xl border border-stone-200/70 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl"><Flower2 className="w-5 h-5" /></div>
            <div>
              <h3 className="font-semibold text-sm text-stone-900">Rangkaian Bunga Bervariasi</h3>
              <p className="text-xs text-stone-500">Dirangkai rapi dengan material berkualitas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl"><Heart className="w-5 h-5" /></div>
            <div>
              <h3 className="font-semibold text-sm text-stone-900">Gratis Kartu Ucapan</h3>
              <p className="text-xs text-stone-500">Tulis pesan personal di setiap buket</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl"><Award className="w-5 h-5" /></div>
            <div>
              <h3 className="font-semibold text-sm text-stone-900">Pemesanan Cepat & Mudah</h3>
              <p className="text-xs text-stone-500">Langsung terhubung ke WhatsApp admin</p>
            </div>
          </div>
        </div>
      </section>

      {/* Katalog Section dengan Grid 2 Kolom di HP (2 Baris ke Bawah) */}
      <section id="katalog" className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Our Collection</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mt-1">Katalog JESMA Bouquet</h2>
          </div>

          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {kategoriList.map((kat) => (
              <button
                key={kat}
                onClick={() => setKategoriAktif(kat)}
                className={`px-3.5 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition ${
                  kategoriAktif === kat
                    ? "bg-emerald-900 text-white shadow-xs"
                    : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
                }`}
              >
                {kat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-500">Memuat koleksi buket...</div>
        ) : produkTersaring.length === 0 ? (
          <div className="text-center py-20 text-stone-500 bg-white rounded-2xl border border-stone-200">
            Belum ada koleksi buket pada kategori ini.
          </div>
        ) : (
          /* grid-cols-2 memastikan tampil 2 kolom di HP / 4 kolom di layar besar */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-6">
            {produkTersaring.map((item) => {
              const isSoldOut = item.status === "Sold Out";
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col group cursor-pointer"
                  onClick={() => setSelectedProduct(item)}
                >
                  <div className="h-44 sm:h-52 md:h-60 overflow-hidden bg-stone-100 relative">
                    <img
                      src={item.gambar_url}
                      alt={item.nama}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2.5 left-2.5 md:top-3 md:left-3 bg-white/95 backdrop-blur-xs text-[10px] md:text-xs font-semibold px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-stone-800 shadow-xs">
                      {item.kategori}
                    </span>

                    {/* Badge Status: Tersedia / Sold Out */}
                    <span className={`absolute top-2.5 right-2.5 md:top-3 md:right-3 text-[10px] md:text-xs font-bold px-2 md:px-2.5 py-0.5 md:py-1 rounded-full shadow-xs ${
                      isSoldOut ? "bg-red-600 text-white" : "bg-emerald-800 text-white"
                    }`}>
                      {isSoldOut ? "Sold Out" : "Tersedia"}
                    </span>
                  </div>

                  <div className="p-3.5 md:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm md:text-lg text-stone-900 mb-1 group-hover:text-emerald-800 transition line-clamp-1">{item.nama}</h3>
                      <p className="text-stone-500 text-xs md:text-sm line-clamp-2 mb-3 md:mb-4">{item.deskripsi}</p>
                    </div>
                    <div className="pt-2.5 md:pt-3 border-t border-stone-100 flex items-center justify-between gap-1">
                      <span className="font-bold text-xs md:text-base text-emerald-900">
                        Rp {item.harga.toLocaleString("id-ID")}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                        disabled={isSoldOut}
                        className={`px-2.5 py-1.5 md:px-3.5 md:py-2 rounded-xl transition flex items-center gap-1 text-[11px] md:text-xs font-medium ${
                          isSoldOut 
                            ? "bg-stone-300 text-stone-500 cursor-not-allowed" 
                            : "bg-stone-900 hover:bg-emerald-900 text-white"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" /> {isSoldOut ? "Habis" : "Pesan"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Menu Custom Order via WhatsApp (Setelah Galeri Instagram) */}
      <section id="custom-order" className="max-w-4xl mx-auto px-4 md:px-6 py-10">
        <div className="bg-white p-6 md:p-10 rounded-3xl border border-stone-200 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 opacity-50"></div>
          <div className="relative z-10 space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                Custom Arrangement
              </span>
              <h2 className="text-xl md:text-3xl font-serif font-bold text-stone-900">
                Buat Pesanan Custom Sesuai Keinginan Anda
              </h2>
              <p className="text-xs md:text-sm text-stone-600">
                Punya konsep warna, jenis bunga, atau budget khusus? Isi form di bawah ini dan terhubung langsung dengan admin kami via WhatsApp!
              </p>
            </div>

            <form onSubmit={handleCustomOrderWhatsApp} className="space-y-4 pt-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama Anda..."
                    value={customNama}
                    onChange={(e) => setCustomNama(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Estimasi Budget (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 200000"
                    value={customBudget}
                    onChange={(e) => setCustomBudget(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Detail / Tema / Catatan Custom</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Kombinasi mawar pink dan putih, untuk kado wisuda, dengan pita warna gold..."
                  value={customDetail}
                  onChange={(e) => setCustomDetail(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
              >
                <MessageCircle className="w-5 h-5" /> Pesan Custom ke WhatsApp
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-16 py-8 md:py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            {logoUrl ? <img src={logoUrl} alt="Logo" className="w-6 h-6 rounded-full object-cover" /> : <Flower2 className="w-5 h-5 text-emerald-800" />}
            <span className="font-serif font-bold text-stone-900">JESMA Bouquet</span>
          </div>
          <p className="text-xs md:text-sm text-stone-500">JESMA Bouquet Jayapura Menyediakan Layanan buket bunga, buket uang, dan kustomisasi terpercaya di Kota Jayapura.</p>
          <p className="text-xs md:text-sm text-stone-500">© 2026 Hak Cipta Dilindungi</p>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs md:text-sm text-stone-600 hover:text-pink-600 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg> Instagram Kami
          </a>
        </div>
      </footer>

      {/* Pop-up Detail Produk Profesional */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-white text-stone-800 p-2 rounded-full shadow-md transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="md:w-1/2 h-64 md:h-auto bg-stone-100 relative">
              <img
                src={selectedProduct.gambar_url}
                alt={selectedProduct.nama}
                className="w-full h-full object-cover"
              />
              <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full shadow-xs ${
                selectedProduct.status === "Sold Out" ? "bg-red-600 text-white" : "bg-emerald-800 text-white"
              }`}>
                {selectedProduct.status || "Tersedia"}
              </span>
            </div>
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-3">
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full">
                  {selectedProduct.kategori}
                </span>
                <h3 className="text-2xl font-serif font-bold text-stone-900">{selectedProduct.nama}</h3>
                <p className="text-xl font-bold text-emerald-900">
                  Rp {selectedProduct.harga.toLocaleString("id-ID")}
                </p>
                <p className="text-stone-600 text-sm leading-relaxed">{selectedProduct.deskripsi}</p>
              </div>

              <div className="pt-6 mt-6 border-t border-stone-100">
                <button
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  disabled={selectedProduct.status === "Sold Out"}
                  className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
                    selectedProduct.status === "Sold Out"
                      ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                      : "bg-emerald-900 hover:bg-emerald-950 text-white"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {selectedProduct.status === "Sold Out" ? "Produk Habis" : "Tambah ke Keranjang"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Keranjang Belanja */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col p-6 overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-stone-200">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-900" /> Keranjang Pesananmu
              </h3>
              <button onClick={() => setIsCartOpen(false)} className="p-1 text-stone-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-stone-400">
                <ShoppingBag className="w-12 h-12 mb-2 opacity-30" />
                <p>Keranjang pesanan masih kosong</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-stone-100 my-4">
                  {cart.map((item) => (
                    <div key={item.id} className="py-3 flex justify-between items-center gap-3">
                      <div>
                        <h4 className="font-semibold text-sm">{item.nama}</h4>
                        <p className="text-xs text-emerald-900 font-medium">
                          Rp {(item.harga * item.qty).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center text-sm"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={checkoutWhatsApp} className="mt-auto pt-4 border-t border-stone-200 space-y-3">
                  <div className="flex justify-between font-bold text-base mb-2">
                    <span>Total Pembayaran</span>
                    <span className="text-emerald-900">Rp {totalHarga.toLocaleString("id-ID")}</span>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Pemesan"
                    value={namaPemesan}
                    onChange={(e) => setNamaPemesan(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                  />
                  <textarea
                    required
                    placeholder="Alamat Pengiriman / Tanggal Ambil"
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    rows={2}
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                  />
                  <textarea
                    placeholder="Isi Kartu Ucapan (Opsional)"
                    value={ucapan}
                    onChange={(e) => setUcapan(e.target.value)}
                    rows={2}
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                  />

                  <button
                    type="submit"
                    className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <Send className="w-4 h-4" /> Lanjut Pesan via WhatsApp
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
