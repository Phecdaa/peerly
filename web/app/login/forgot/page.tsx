"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const supabase = getSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login/update-password`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess(true);
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
            Lupa Password
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Masukkan email terdaftar untuk menerima link reset password.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-5">
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700">
              Link reset password telah dikirim ke email Anda! Silakan cek kotak masuk atau folder spam.
            </div>
            <Link href="/login" className="inline-block px-4 py-2.5 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition text-sm"
                placeholder="nama@email.com"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-blue-600 text-white font-medium rounded-xl py-3 text-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Mengirim..." : "Kirim Link Reset"}
            </button>

            <div className="text-center pt-4 border-t border-zinc-100">
              <Link href="/login" className="text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors">
                Kembali
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
