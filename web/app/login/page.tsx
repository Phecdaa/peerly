"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md text-body-md antialiased">
      {/* Left Side: Auth Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-8">
              <span className="material-symbols-outlined text-blue-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
              <span className="text-2xl font-black text-blue-600 font-h2">Peerly</span>
            </div>
            <h2 className="mt-6 font-h2 text-h2 text-on-background">
              {mode === "login" ? "Welcome to Peerly" : "Join Peerly"}
            </h2>
            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
              {mode === "login" ? "Log in to Peerly to continue your study sessions." : "Create an account to start your study sessions."}
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {mode === "register" && (
                <div>
                  <label htmlFor="fullName" className="block font-label-md text-label-md text-on-surface">Full Name</label>
                  <div className="mt-1">
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full appearance-none rounded-lg border border-outline-variant px-md py-3 placeholder-outline font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all bg-surface"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block font-label-md text-label-md text-on-surface">Email address</label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-lg border border-outline-variant px-md py-3 placeholder-outline font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all bg-surface"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block font-label-md text-label-md text-on-surface">Password</label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full appearance-none rounded-lg border border-outline-variant px-md py-3 placeholder-outline font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all bg-surface"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert" aria-live="polite">
                  {error}
                </div>
              )}

              {mode === "login" && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface" />
                    <label htmlFor="remember-me" className="ml-2 block font-label-md text-label-md text-on-surface-variant">Remember me</label>
                  </div>
                  <div className="font-label-md text-label-md">
                    <Link href="/login/forgot" className="font-medium text-primary hover:text-on-primary-fixed-variant">Forgot your password?</Link>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-lg bg-primary px-4 py-3 font-label-md text-label-md text-on-primary hover:bg-on-primary-fixed-variant focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors shadow-sm"
                >
                  {loading ? "Processing..." : mode === "login" ? "Sign in" : "Sign up"}
                </button>
              </div>
            </form>

            {/* SSO / Divider */}
            <div className="mt-6">
              <div className="relative">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant"></div>
                </div>
                <div className="relative flex justify-center font-label-sm text-label-sm">
                  <span className="bg-background px-2 text-on-surface-variant">Or</span>
                </div>
              </div>
              <div className="mt-6">
                <button type="button" className="flex w-full justify-center items-center gap-3 rounded-lg bg-surface-container px-4 py-3 font-label-md text-label-md text-on-surface hover:bg-surface-container-high focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors border border-outline-variant">
                  <span className="material-symbols-outlined text-on-surface text-xl">school</span>
                  Sign in with University Email
                </button>
              </div>
            </div>

            <p className="mt-8 text-center font-label-md text-label-md text-on-surface-variant">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="font-medium text-primary hover:text-on-primary-fixed-variant">
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Image/Illustration */}
      <div className="relative hidden w-0 flex-1 lg:block bg-surface-container-high">
        <img alt="Students" className="absolute inset-0 h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2UNmqrYFFoIggs9Y_pWc2ouf5gmxG0oOu1xImIp30mWm6olaF-iaaWHD7NOdxUBLRPor5ARQaE2_dGwf-eeJ88B9YDH_PhjNX1p6lD0qHWLBvdgq_VR9yCRRGO8eKAltkSRUlutP2rpnEX1UVnc2QLhzzjNa13R17GE6yloRmEv-wXqj88SB29Ws4gC1zwD3t18GkW5vyFN3Mse5_QOMYZOabnr5MXEqUoACT1Gu3l_8GFIMVf0uPdw5jETCGsIT_iS1-Saojqg0C" />
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary-fixed/80 to-transparent"></div>
        <div className="absolute bottom-12 left-12 right-12 text-on-primary-fixed">
          <h3 className="font-h1 text-h1 mb-4 text-on-primary-fixed">Structured Empathy.</h3>
          <p className="font-body-lg text-body-lg text-on-primary-fixed max-w-xl">Join thousands of students building better study habits through peer accountability and focused collaboration.</p>
        </div>
      </div>
    </div>
  );
}
