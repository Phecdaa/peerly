"use client";
import { useState, useRef, useEffect } from "react";
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
    bio: profile.bio || "",
    university: profile.university || "",
    major: profile.major || "",
    timezone: profile.timezone || "Asia/Jakarta",
  });
  
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [activeSection, setActiveSection] = useState("personal-info");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Interface Mode Switch ──
  const isApprovedMentor = profile.is_mentor && profile.mentor_status === "approved";
  const [currentMode, setCurrentMode] = useState<"student" | "mentor">("student");

  useEffect(() => {
    // Read cookie on mount
    const match = document.cookie.match(/(?:^|; )peerly_mode=([^;]*)/);
    if (match && match[1] === "mentor" && isApprovedMentor) {
      setCurrentMode("mentor");
    }
  }, [isApprovedMentor]);

  function switchMode(newMode: "student" | "mentor") {
    setCurrentMode(newMode);
    document.cookie = `peerly_mode=${newMode}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    router.refresh();
  }

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

  async function removeAvatar() {
    if (!avatarUrl) return;
    setLoading(true);
    await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
    setAvatarUrl(null);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex-1 w-full flex flex-col pt-4">
      {/* Page Header */}
      <div className="mb-xl">
        <h1 className="font-h1 text-h1 text-on-surface mb-xs">Account Settings</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Manage your personal details, academic profile, and preferences.</p>
      </div>

      {/* ── Interface Mode Switch (only for approved mentors) ── */}
      {isApprovedMentor && (
        <div className="mb-lg bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-lg border-b border-outline-variant/30 bg-surface-bright/50">
            <h2 className="font-h3 text-h3 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>swap_horiz</span>
              Interface Mode
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Beralih antara tampilan Mahasiswa dan Mentor.</p>
          </div>
          <div className="p-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              {/* Student Mode Card */}
              <button
                onClick={() => switchMode("student")}
                className={`relative flex flex-col items-center text-center p-lg rounded-xl border-2 transition-all duration-300 group ${
                  currentMode === "student"
                    ? "border-primary bg-primary-fixed/15 shadow-[0_8px_30px_rgba(0,88,190,0.12)]"
                    : "border-outline-variant/50 bg-surface hover:border-primary/30 hover:bg-surface-container-low"
                }`}
              >
                {currentMode === "student" && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  </div>
                )}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-md transition-colors ${
                  currentMode === "student" ? "bg-primary-container text-primary" : "bg-surface-container-high text-on-surface-variant group-hover:bg-primary-container/50 group-hover:text-primary"
                }`}>
                  <span className="material-symbols-outlined text-[28px]" style={currentMode === "student" ? { fontVariationSettings: "'FILL' 1" } : {}}>school</span>
                </div>
                <h3 className={`font-h3 text-[18px] mb-xs transition-colors ${
                  currentMode === "student" ? "text-primary" : "text-on-surface"
                }`}>Mode Mahasiswa</h3>
                <p className="font-body-md text-[13px] text-on-surface-variant">Cari mentor, join room, dan belajar bersama.</p>
              </button>

              {/* Mentor Mode Card */}
              <button
                onClick={() => switchMode("mentor")}
                className={`relative flex flex-col items-center text-center p-lg rounded-xl border-2 transition-all duration-300 group ${
                  currentMode === "mentor"
                    ? "border-secondary bg-secondary-container/20 shadow-[0_8px_30px_rgba(0,108,73,0.12)]"
                    : "border-outline-variant/50 bg-surface hover:border-secondary/30 hover:bg-surface-container-low"
                }`}
              >
                {currentMode === "mentor" && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  </div>
                )}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-md transition-colors ${
                  currentMode === "mentor" ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-high text-on-surface-variant group-hover:bg-secondary-container/50 group-hover:text-secondary"
                }`}>
                  <span className="material-symbols-outlined text-[28px]" style={currentMode === "mentor" ? { fontVariationSettings: "'FILL' 1" } : {}}>psychology</span>
                </div>
                <h3 className={`font-h3 text-[18px] mb-xs transition-colors ${
                  currentMode === "mentor" ? "text-secondary" : "text-on-surface"
                }`}>Mode Mentor</h3>
                <p className="font-body-md text-[13px] text-on-surface-variant">Kelola jadwal, terima sesi, dan lihat earnings.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-gutter items-start">
        {/* Inner Sidebar / Secondary Nav */}
        <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 z-10 bg-background pb-4 lg:pb-0">
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
            <a href="#personal-info" onClick={() => setActiveSection("personal-info")} className={`whitespace-nowrap px-4 py-3 rounded-lg font-label-md text-label-md flex items-center gap-3 transition-colors ${activeSection === "personal-info" ? "bg-surface-variant text-primary border border-primary-container/20" : "text-on-surface-variant hover:bg-surface-container-low border border-transparent"}`}>
              <span className="material-symbols-outlined text-[20px]" style={activeSection === "personal-info" ? { fontVariationSettings: "'FILL' 1" } : {}}>person</span>
              Personal Info
            </a>
            <a href="#academic-info" onClick={() => setActiveSection("academic-info")} className={`whitespace-nowrap px-4 py-3 rounded-lg font-label-md text-label-md flex items-center gap-3 transition-colors ${activeSection === "academic-info" ? "bg-surface-variant text-primary border border-primary-container/20" : "text-on-surface-variant hover:bg-surface-container-low border border-transparent"}`}>
              <span className="material-symbols-outlined text-[20px]" style={activeSection === "academic-info" ? { fontVariationSettings: "'FILL' 1" } : {}}>school</span>
              Academic Info
            </a>
            {profile.mentor_status === "approved" ? (
              <Link href="/mentor/availability" className="whitespace-nowrap px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low font-label-md text-label-md flex items-center gap-3 transition-colors">
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                Mentor Schedule
              </Link>
            ) : (
              <Link href="/apply" className="whitespace-nowrap px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low font-label-md text-label-md flex items-center gap-3 transition-colors">
                <span className="material-symbols-outlined text-[20px]">campaign</span>
                Become a Mentor
              </Link>
            )}
            <form action="/auth/sign-out" method="POST" className="w-full">
              <button type="submit" className="w-full whitespace-nowrap px-4 py-3 rounded-lg text-error hover:bg-error-container/20 font-label-md text-label-md flex items-center gap-3 transition-colors text-left">
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Log Out
              </button>
            </form>
          </nav>
        </aside>

        {/* Settings Forms Area */}
        <div className="flex-1 w-full max-w-3xl space-y-lg">
          {/* Profile Picture Card */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-md lg:p-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center gap-lg">
            <div className="relative group">
              <div 
                className="w-24 h-24 rounded-full overflow-hidden bg-surface-container-highest border-4 border-surface-container-lowest shadow-sm bg-cover bg-center"
                style={{ backgroundImage: `url(${avatarUrl || "https://api.dicebear.com/7.x/initials/svg?seed="+encodeURIComponent(formData.full_name || user.email)})` }}
              >
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary-fixed-variant transition-colors border-2 border-surface-container-lowest"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h3 className="font-h3 text-h3 text-on-surface mb-xs">Profile Picture</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-md">A picture helps your peers recognize you in study sessions.</p>
              <div className="flex gap-3 justify-center sm:justify-start">
                <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="px-4 py-2 bg-surface-container-low text-primary font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50">Upload New</button>
                <button onClick={removeAvatar} disabled={loading || !avatarUrl} className="px-4 py-2 text-error font-label-md text-label-md rounded-lg hover:bg-error-container/50 transition-colors disabled:opacity-50">Remove</button>
              </div>
            </div>
          </div>

          {/* Personal Details Form */}
          <div id="personal-info" className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden scroll-mt-24">
            <div className="p-lg border-b border-outline-variant/30 bg-surface-bright/50">
              <h2 className="font-h3 text-h3 text-on-surface">Personal Information</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Update your basic profile details.</p>
            </div>
            <div className="p-lg space-y-md">
              <div className="space-y-sm">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Full Name</label>
                <input 
                  type="text" 
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none font-body-md text-body-md" 
                />
              </div>

              <div className="space-y-sm">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </span>
                  <input 
                    type="email" 
                    value={formData.email}
                    disabled 
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-outline-variant/50 bg-surface-container-low text-on-surface-variant cursor-not-allowed font-body-md text-body-md" 
                  />
                </div>
                <p className="text-xs text-outline mt-1">Email cannot be changed.</p>
              </div>

              <div className="space-y-sm">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none font-body-md text-body-md" 
                  placeholder="+62..."
                />
              </div>

              <div className="space-y-sm">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Bio</label>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none font-body-md text-body-md resize-none" 
                  rows={4}
                  placeholder="Write a short introduction for your peers..."
                ></textarea>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-outline">Write a short introduction for your peers.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Details Form */}
          <div id="academic-info" className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden scroll-mt-24">
            <div className="p-lg border-b border-outline-variant/30 bg-surface-bright/50">
              <h2 className="font-h3 text-h3 text-on-surface">Academic Information</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Where do you study and what is your major?</p>
            </div>
            <div className="p-lg space-y-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-sm">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">University</label>
                  <input 
                    type="text" 
                    value={formData.university}
                    onChange={(e) => setFormData({...formData, university: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none font-body-md text-body-md" 
                    placeholder="e.g. Universitas Indonesia"
                  />
                </div>
                <div className="space-y-sm">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Major</label>
                  <input 
                    type="text" 
                    value={formData.major}
                    onChange={(e) => setFormData({...formData, major: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none font-body-md text-body-md" 
                    placeholder="e.g. Computer Science"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location / Timezone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-3 mb-md">
                <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <h3 className="font-label-md text-label-md text-on-surface font-semibold">Timezone</h3>
                  <p className="text-xs text-on-surface-variant">For scheduling sessions</p>
                </div>
              </div>
              <div className="relative">
                <select 
                  value={formData.timezone}
                  onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none font-body-md text-body-md appearance-none"
                >
                  <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
                  <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
                  <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-3 mb-md">
                <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined">translate</span>
                </div>
                <div>
                  <h3 className="font-label-md text-label-md text-on-surface font-semibold">Language</h3>
                  <p className="text-xs text-on-surface-variant">Interface preference</p>
                </div>
              </div>
              <div className="relative">
                <select className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all outline-none font-body-md text-body-md appearance-none">
                  <option value="en">English (US)</option>
                  <option value="id">Bahasa Indonesia</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="sticky bottom-4 z-20 p-md border border-outline-variant/30 bg-surface-bright/95 backdrop-blur-md flex justify-end gap-3 rounded-xl shadow-lg mt-8">
            <button 
              type="button" 
              onClick={() => router.refresh()} 
              className="px-6 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors"
            >
              Discard Changes
            </button>
            <button 
              type="button" 
              onClick={handleSave} 
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-fixed-variant shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
