"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace("/dashboard");
      }
    });
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();

    try {
      if (mode === "register") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }
      }

      router.replace("/dashboard");
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
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
          <h1 className="sr-only">
            Peerly
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Masuk atau daftar untuk booking sesi belajar dengan mentor.
          </p>
        </div>

        <div className="mb-6 flex rounded-full bg-zinc-100 p-1 text-sm font-medium">
          <button
            type="button"
            className={`flex-1 rounded-full px-4 py-2.5 transition-all ${
              mode === "login"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
            onClick={() => setMode("login")}
          >
            Masuk
          </button>
          <button
            type="button"
            className={`flex-1 rounded-full px-4 py-2.5 transition-all ${
              mode === "register"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
            onClick={() => setMode("register")}
          >
            Daftar
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Nama lengkap
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input"
                placeholder="Contoh: Ahmad Rizki"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="nama@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Min. 6 karakter"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {error && (
            <div
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary mt-2 w-full py-3 text-sm"
          >
            {loading
              ? "Memproses..."
              : mode === "login"
              ? "Masuk"
              : "Daftar"}
          </button>
        </form>
      </div>
    </div>
  );
}

