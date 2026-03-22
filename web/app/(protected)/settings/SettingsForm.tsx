"use client";
import { useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SettingsForm({ user, profile }: any) {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    email: profile.email || user.email,
    phone_number: profile.phone_number || "",
    gender: profile.gender || "",
    region: profile.region || "",
    major: profile.major || "",
    semester: profile.semester || "",
    university: profile.university || "",
  });
  
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const memberSinceStr = profile.created_at ? new Date(profile.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric", day: "2-digit" }) : "";

  async function handleSave() {
    setLoading(true);
    const { error } = await supabase.from("profiles").update(formData).eq("id", user.id);
    setLoading(false);
    if (error) alert("Error saving profile: " + error.message);
    else {
      alert("Profil berhasil diperbarui!");
      router.refresh();
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
     const file = e.target.files?.[0];
     if (!file) return;
     setLoading(true);
     const fileExt = file.name.split('.').pop();
     const filePath = `${user.id}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

     const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
     if (uploadError) {
        alert("Gagal mengunggah foto: " + uploadError.message);
        setLoading(false);
        return;
     }

     const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
     await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
     setAvatarUrl(publicUrl);
     setLoading(false);
  }

  return (
    <div className="pb-8">
      {/* Background Banner - Biru Tema Peerly */}
      <div className="bg-blue-600 px-6 pt-12 pb-14 text-white relative flex items-center justify-between w-full">
        <div className="flex items-center gap-3 md:hidden">
          <img src="/logo-putih.png" alt="Peerly Icon" className="w-10 h-10 object-contain" />
          <img src="/nama-putih.png" alt="Peerly" className="h-5 object-contain mb-[2px]" />
        </div>
        <div className="flex items-center gap-3 ml-auto">
           <Link href="/notifications" className="relative p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
           </Link>
        </div>
      </div>

      {/* Profile Section Overlapping */}
      <div className="-mt-14 flex flex-col items-center px-4 relative z-10 w-full max-w-lg mx-auto">
        <div className="relative group">
          <div 
            className="w-28 h-28 rounded-full bg-slate-200 border-[5px] border-white shadow-md overflow-hidden bg-cover bg-center transition" 
            style={{ backgroundImage: `url(${avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed="+encodeURIComponent(formData.full_name || user.email)})` }}
          ></div>
          <button 
             onClick={() => fileInputRef.current?.click()}
             className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full shadow-md text-white hover:bg-blue-700 transition"
          >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
        </div>
        
        {memberSinceStr && <p className="mt-3 text-[11px] font-medium tracking-wide text-zinc-500 uppercase">Member Sejak {memberSinceStr}</p>}

        {/* Card Identitas */}
        <div className="bg-white w-full rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-zinc-100 p-5 mt-5 space-y-4">
          <div className="flex justify-between items-end">
             <div className="w-full relative group">
               <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Nama</label>
               <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="text-zinc-900 border-b-2 border-zinc-100 w-full pb-1.5 outline-none text-sm font-semibold focus:border-blue-500 bg-transparent transition-colors" />
             </div>
             <button onClick={handleSave} disabled={loading} className="text-blue-600 hover:text-blue-700 p-1 shrink-0 ml-3 mb-1" title="Simpan Perubahan">
                {loading ? <span className="text-xs">...</span> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
             </button>
          </div>
          
          <div className="relative group">
            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Email</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="text-zinc-900 border-b-2 border-zinc-100 w-full pb-1.5 outline-none text-sm focus:border-blue-500 bg-transparent transition-colors" />
          </div>

          <div className="relative group">
            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">No Telepon</label>
            <input type="tel" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} className="text-zinc-900 border-b-2 border-zinc-100 w-full pb-1.5 outline-none text-sm focus:border-blue-500 bg-transparent transition-colors" placeholder="Masukkan no telp..." />
          </div>
          
          {/* Tambahan Info Pelajar */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="relative group">
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Kampus</label>
              <input type="text" value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} className="text-zinc-900 border-b-2 border-zinc-100 w-full pb-1.5 outline-none text-sm focus:border-blue-500 bg-transparent transition-colors" placeholder="-" />
            </div>
            <div className="relative group">
              <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Jurusan</label>
              <input type="text" value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})} className="text-zinc-900 border-b-2 border-zinc-100 w-full pb-1.5 outline-none text-sm focus:border-blue-500 bg-transparent transition-colors" placeholder="-" />
            </div>
          </div>
        </div>
        
        {/* Menu List Bawah */}
        <div className="bg-white w-full rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-zinc-100 mt-6 overflow-hidden">
           {/* Link Mentor Area */}
           <Link href={profile.mentor_status === "approved" ? `/mentor/availability` : "/apply"} className="flex items-center justify-between p-4 border-b border-blue-50 bg-blue-50/30 hover:bg-blue-50 transition group">
              <span className="text-sm font-bold text-blue-700">
                 {profile.mentor_status === "approved" ? "Kelola Jadwal Mentor" : (profile.is_mentor ? "Status Pengajuan Mentor" : "Daftar Jadi Mentor")}
              </span>
              <svg className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
           </Link>

           <Link href="/dashboard" className="flex items-center justify-between p-4 border-b border-zinc-50 hover:bg-zinc-50 transition group">
              <span className="text-sm font-medium text-zinc-700">Beranda Dashboard</span>
              <svg className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
           </Link>
           <div className="flex items-center justify-between p-4 border-b border-zinc-50 hover:bg-zinc-50 transition cursor-pointer group">
              <span className="text-sm font-medium text-zinc-700">Atur Ulang Password</span>
              <svg className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
           </div>
           <div className="flex items-center justify-between p-4 border-b border-zinc-50 hover:bg-zinc-50 transition cursor-pointer group">
              <span className="text-sm font-medium text-zinc-700">Kebijakan Privasi</span>
              <svg className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
           </div>
           <form action="/auth/sign-out" method="POST" className="flex items-center justify-between p-4 hover:bg-red-50 hover:text-red-700 text-zinc-700 transition cursor-pointer group">
              <button type="submit" className="text-sm font-medium w-full text-left flex justify-between items-center">
                 Keluar
                 <svg className="w-4 h-4 text-red-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
           </form>
        </div>

      </div>
    </div>
  );
}
