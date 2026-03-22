"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Memastikan hash fragment event PASSWORD_RECOVERY di-handle otomatis oleh supabase client
    const supabase = getSupabaseBrowserClient();
    supabase.auth.onAuthStateChange(async (event, session) => {
      // Event PASSWORD_RECOVERY will be fired if the PKCE hash implies recovery mode
      if (event === "PASSWORD_RECOVERY") {
        console.log("Ready to recover password", session);
      }
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      alert("Password berhasil diperbarui!");
      router.replace("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-lg shadow-zinc-900/10">
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="flex justify-center items-center gap-2 mb-2 w-full">
            <img src="/logo.png" alt="Peerly Icon" className="w-12 h-12 object-contain drop-shadow-sm" />
            <img src="/nama.png" alt="Peerly" className="h-7 object-contain drop-shadow-sm mt-1" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 mt-2">
            Perbarui Password
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Masukkan password baru Anda di bawah ini.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Password Baru
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition text-sm"
              placeholder="Minimal 6 karakter"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-blue-600 text-white font-medium rounded-xl py-3 text-sm hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Password Baru"}
          </button>
          
          <div className="text-center pt-4">
             <Link href="/login" className="text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors">
                Kembali ke Login
             </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
