"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Trash2, Edit2, CheckCircle2, Upload, ArrowLeft, ShieldAlert, Globe, Phone, Save, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface Produk {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  deskripsi: string;
  gambar_url: string;
  status: string;
}

interface BannerIklan {
  id: number;
  gambar_url: string;
  judul?: string;
}

export default function HalamanAdminOwner() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [bannerList, setBannerList] = useState<BannerIklan[]>([]);

  const [uploading, setUploading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const [fileGambar, setFileGambar] = useState<File | null>(null);
  const [fileBanner, setFileBanner] = useState<File | null>(null);
  const [fileLogo, setFileLogo] = useState<File | null>(null);

  const [instagramUrl, setInstagramUrl] = useState("");
  const [whatsappNo, setWhatsappNo] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [judulBanner, setJudulBanner] = useState("");

  const [formProduk, setFormProduk] = useState({
    nama: "",
    kategori: "Romantis",
    harga: "",
    deskripsi: "",
    status: "Tersedia",
  });

  const [editProdukId, setEditProdukId] = useState<number | null>(null);

  const PASSWORD_OWNER = "Jeschika2026";

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  async function fetchData() {
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
      setInstagramUrl(dataSetting.instagram_url || "");
      setWhatsappNo(dataSetting.whatsapp_no || "");
      setLogoUrl(dataSetting.logo_url || "");
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === PASSWORD_OWNER) {
      setIsAuthenticated(true);
    } else {
      alert("Akses ditolak! Kata sandi Owner salah.");
    }
  };

  const handleSimpanPengaturan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    const { error } = await supabase
      .from("pengaturan_toko")
      .upsert({ id: 1, instagram_url: instagramUrl, whatsapp_no: whatsappNo, logo_url: logoUrl });

    setSavingSettings(false);
    if (!error) {
      alert("Pengaturan Toko berhasil diperbarui!");
      fetchData();
    } else {
      alert("Gagal menyimpan pengaturan: " + error.message);
    }
  };

  const handleUploadLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileLogo) {
      alert("Pilih file logo terlebih dahulu!");
      return;
    }
    setUploadingLogo(true);
    try {
      const ekstensi = fileLogo.name.split(".").pop();
      const namaFile = `logo_${Date.now()}.${ekstensi}`;
      const { error: uploadError } = await supabase.storage.from("gambar-buket").upload(namaFile, fileLogo);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("gambar-buket").getPublicUrl(namaFile);
      setLogoUrl(urlData.publicUrl);

      await supabase.from("pengaturan_toko").upsert({
        id: 1,
        instagram_url: instagramUrl,
        whatsapp_no: whatsappNo,
        logo_url: urlData.publicUrl,
      });

      setFileLogo(null);
      alert("Logo utama berhasil diperbarui!");
      fetchData();
    } catch (err: any) {
      alert("Gagal upload logo: " + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleUploadBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileBanner) {
      alert("Pilih file foto banner untuk Bingkai Koleksi Jesma!");
      return;
    }
    setUploadingBanner(true);
    try {
      const ekstensi = fileBanner.name.split(".").pop();
      const namaFile = `banner_${Date.now()}.${ekstensi}`;
      const { error: uploadError } = await supabase.storage.from("gambar-buket").upload(namaFile, fileBanner);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("gambar-buket").getPublicUrl(namaFile);

      const { error: dbError } = await supabase.from("banner_iklan").insert([
        {
          gambar_url: urlData.publicUrl,
          judul: judulBanner || "Koleksi Spesial Jesma",
        },
      ]);
      if (dbError) throw dbError;

      setFileBanner(null);
      setJudulBanner("");
      fetchData();
      alert("Banner iklan berhasil ditambahkan ke slideshow!");
    } catch (err: any) {
      alert("Gagal upload banner: " + err.message);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleHapusBanner = async (id: number) => {
    if (!confirm("Hapus foto banner ini dari slideshow?")) return;
    await supabase.from("banner_iklan").delete().eq("id", id);
    fetchData();
  };

  const handleSimpanProduk = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editProdukId && !fileGambar) {
      alert("Silakan pilih file foto buket (JPG/PNG) untuk produk baru!");
      return;
    }

    setUploading(true);
    try {
      let publicUrl = "";
      if (fileGambar) {
        const ekstensi = fileGambar.name.split(".").pop();
        const namaFile = `${Date.now()}.${ekstensi}`;
        const { error: uploadError } = await supabase.storage.from("gambar-buket").upload(namaFile, fileGambar);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("gambar-buket").getPublicUrl(namaFile);
        publicUrl = urlData.publicUrl;
      }

      if (editProdukId) {
        // Update produk
        const updateData: any = {
          nama: formProduk.nama,
          kategori: formProduk.kategori,
          harga: Number(formProduk.harga),
          deskripsi: formProduk.deskripsi,
          status: formProduk.status,
        };
        if (publicUrl) updateData.gambar_url = publicUrl;

        const { error } = await supabase.from("produk_buket").update(updateData).eq("id", editProdukId);
        if (error) throw error;
        alert("Produk berhasil diperbarui!");
      } else {
        // Tambah produk baru
        const { error } = await supabase.from("produk_buket").insert([
          {
            nama: formProduk.nama,
            kategori: formProduk.kategori,
            harga: Number(formProduk.harga),
            deskripsi: formProduk.deskripsi,
            status: formProduk.status,
            gambar_url: publicUrl,
          },
        ]);
        if (error) throw error;
        alert("Produk berhasil ditambahkan ke katalog!");
      }

      setFormProduk({ nama: "", kategori: "Romantis", harga: "", deskripsi: "", status: "Tersedia" });
      setFileGambar(null);
      setEditProdukId(null);
      fetchData();
    } catch (err: any) {
      alert("Gagal menyimpan produk: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEditClick = (p: Produk) => {
    setEditProdukId(p.id);
    setFormProduk({
      nama: p.nama,
      kategori: p.kategori,
      harga: String(p.harga),
      deskripsi: p.deskripsi,
      status: p.status || "Tersedia",
    });
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleHapusProduk = async (id: number) => {
    if (!confirm("Yakin ingin menghapus buket ini dari katalog?")) return;
    await supabase.from("produk_buket").delete().eq("id", id);
    fetchData();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-stone-200 max-w-md w-full space-y-5 shadow-md">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Area Terbatas — Khusus Owner</p>
              <p className="text-xs text-amber-800 mt-1">
                Halaman ini hanya diperuntukkan bagi pemilik <b>JESMA Bouquet</b>.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">Kata Sandi Owner</label>
              <input
                type="password"
                required
                placeholder="Masukkan kata sandi..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-800"
              />
            </div>
            <button type="submit" className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-medium py-2.5 rounded-xl transition">
              Masuk ke Dasbor Owner
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-stone-500 hover:text-stone-800">← Kembali ke Halaman Utama Toko</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Owner Dashboard</span>
            <h1 className="text-xl font-bold text-stone-900">Pengelolaan JESMA Bouquet</h1>
          </div>
          <Link href="/" className="text-sm bg-stone-100 hover:bg-stone-200 text-stone-800 px-4 py-2 rounded-full flex items-center gap-1.5 font-medium transition">
            <ArrowLeft className="w-4 h-4" /> Lihat Website
          </Link>
        </div>

        {/* Pengaturan Logo Utama */}
        <form onSubmit={handleUploadLogo} className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 shadow-xs">
          <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-800" /> Upload Logo Utama Toko
          </h2>
          <div className="flex items-center gap-4">
            {logoUrl && (
              <img src={logoUrl} alt="Logo Preview" className="w-14 h-14 rounded-full object-cover border border-stone-200 shadow-xs" />
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onChange={(e) => setFileLogo(e.target.files?.[0] || null)}
                className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={uploadingLogo}
            className="bg-emerald-900 hover:bg-emerald-950 text-white text-sm font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 transition"
          >
            <Upload className="w-4 h-4" /> {uploadingLogo ? "Mengunggah Logo..." : "Simpan Logo Utama"}
          </button>
        </form>

        {/* Pengaturan Kontak */}
        <form onSubmit={handleSimpanPengaturan} className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 shadow-xs">
          <h2 className="font-bold text-stone-900 text-base">Pengaturan Kontak & Media Sosial</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-600 flex items-center gap-1.5 mb-1.5">
                <Globe className="w-4 h-4 text-pink-600" /> Link Akun Instagram Toko
              </label>
              <input
                type="url"
                required
                placeholder="https://instagram.com"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-600 flex items-center gap-1.5 mb-1.5">
                <Phone className="w-4 h-4 text-emerald-700" /> Nomor WhatsApp (Awalan 62)
              </label>
              <input
                type="text"
                required
                placeholder="6281234567890"
                value={whatsappNo}
                onChange={(e) => setWhatsappNo(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={savingSettings}
            className="bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" /> {savingSettings ? "Menyimpan..." : "Simpan Pengaturan Kontak"}
          </button>
        </form>

        {/* Upload Banner / Foto untuk Bingkai Koleksi Jesma (Slideshow) */}
        <form onSubmit={handleUploadBanner} className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 shadow-xs">
          <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-600" /> Upload Foto Bingkai Koleksi Jesma (Slideshow Iklan)
          </h2>
          <input
            type="text"
            placeholder="Judul Banner / Keterangan Iklan (opsional)"
            value={judulBanner}
            onChange={(e) => setJudulBanner(e.target.value)}
            className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
          />
          <div className="border-2 border-dashed border-stone-300 rounded-xl p-4 text-center hover:border-emerald-700 transition">
            <label className="cursor-pointer flex flex-col items-center gap-1 text-sm text-stone-600">
              <Upload className="w-5 h-5 text-emerald-800" />
              <span>{fileBanner ? fileBanner.name : "Pilih foto banner iklan untuk slideshow"}</span>
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onChange={(e) => setFileBanner(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={uploadingBanner}
            className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 transition"
          >
            <Upload className="w-4 h-4" /> {uploadingBanner ? "Mengunggah..." : "Tambah ke Slideshow Iklan"}
          </button>

          {/* Daftar Banner Terunggah */}
          <div className="pt-3">
            <p className="text-xs font-semibold text-stone-600 mb-2">Daftar Banner Aktif ({bannerList.length}):</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {bannerList.map((b) => (
                <div key={b.id} className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-50 group h-24">
                  <img src={b.gambar_url} alt="Banner" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleHapusBanner(b.id)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition"
                    title="Hapus Banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Form Tambah / Edit Produk */}
        <form onSubmit={handleSimpanProduk} className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              {editProdukId ? "Edit Koleksi Buket" : "Tambah Koleksi Buket Baru"}
            </h2>
            {editProdukId && (
              <button
                type="button"
                onClick={() => {
                  setEditProdukId(null);
                  setFormProduk({ nama: "", kategori: "Romantis", harga: "", deskripsi: "", status: "Tersedia" });
                }}
                className="text-xs text-red-600 underline"
              >
                Batalkan Edit
              </button>
            )}
          </div>

          <input
            type="text"
            required
            placeholder="Nama Buket (contoh: Blue Hydrangea Luxury)"
            value={formProduk.nama}
            onChange={(e) => setFormProduk({ ...formProduk, nama: e.target.value })}
            className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
          />

          <div className="grid grid-cols-3 gap-3">
            <select
              value={formProduk.kategori}
              onChange={(e) => setFormProduk({ ...formProduk, kategori: e.target.value })}
              className="border border-stone-300 rounded-xl px-3 py-2.5 text-sm bg-white"
            >
              <option value="Romantis">Romantis</option>
              <option value="Wisuda">Wisuda</option>
              <option value="Ulang Tahun">Ulang Tahun</option>
              <option value="Pernikahan">Pernikahan</option>
            </select>

            <select
              value={formProduk.status}
              onChange={(e) => setFormProduk({ ...formProduk, status: e.target.value })}
              className="border border-stone-300 rounded-xl px-3 py-2.5 text-sm bg-white font-semibold text-emerald-800"
            >
              <option value="Tersedia">Tersedia</option>
              <option value="Sold Out">Sold Out</option>
            </select>

            <input
              type="number"
              required
              placeholder="Harga (175000)"
              value={formProduk.harga}
              onChange={(e) => setFormProduk({ ...formProduk, harga: e.target.value })}
              className="border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <div className="border-2 border-dashed border-stone-300 rounded-xl p-4 text-center hover:border-emerald-700 transition">
            <label className="cursor-pointer flex flex-col items-center gap-1 text-sm text-stone-600">
              <Upload className="w-5 h-5 text-emerald-800" />
              <span>{fileGambar ? fileGambar.name : editProdukId ? "Ganti foto buket (opsional)" : "Pilih foto buket (JPG / PNG)"}</span>
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onChange={(e) => setFileGambar(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            required
            placeholder="Deskripsi singkat rangkaian bunga..."
            value={formProduk.deskripsi}
            onChange={(e) => setFormProduk({ ...formProduk, deskripsi: e.target.value })}
            rows={3}
            className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm"
          />

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition"
          >
            {uploading ? "Menyimpan..." : editProdukId ? "Simpan Perubahan Produk" : "Simpan ke Katalog"}
          </button>
        </form>

        {/* Daftar Katalog & Aksi (Edit, Sold Out Status, Hapus) */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <h2 className="font-bold text-stone-900 text-base mb-4">Daftar Katalog Aktif ({produkList.length})</h2>
          <div className="divide-y divide-stone-100">
            {produkList.map((p) => (
              <div key={p.id} className="py-3.5 flex justify-between items-center gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={p.gambar_url}
                    alt={p.nama}
                    className="w-14 h-14 rounded-xl object-cover bg-stone-100 border border-stone-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-stone-900">{p.nama}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === "Sold Out" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {p.status || "Tersedia"}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {p.kategori} • Rp {p.harga.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Tombol Edit */}
                  <button
                    onClick={() => handleEditClick(p)}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition"
                    title="Edit Produk"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {/* Tombol Hapus */}
                  <button
                    onClick={() => handleHapusProduk(p.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-xl transition"
                    title="Hapus Produk"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}