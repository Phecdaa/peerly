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
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-sm shadow-zinc-900/5">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-zinc-900">Peerly</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Login untuk booking sesi belajar.
          </p>
        </div>

        <div className="mb-6 flex rounded-full bg-zinc-100 p-1 text-sm font-medium">
          <button
            type="button"
            className={`flex-1 rounded-full px-4 py-2 ${
              mode === "login"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500"
            }`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 rounded-full px-4 py-2 ${
              mode === "register"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500"
            }`}
            onClick={() => setMode("register")}
          >
            Register
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
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" aria-live="polite">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary mt-2 w-full"
          >
            {loading
              ? "Memproses..."
              : mode === "login"
              ? "Login"
              : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-zinc-500">
          Dev: matikan email confirmation di Supabase Auth.
        </p>
      </div>
    </div>
  );
}

