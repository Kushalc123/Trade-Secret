/* src/app/auth/page.tsx */
"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { FaGoogle } from "react-icons/fa";

export default function AuthPage() {
  const supabase = supabaseBrowser();

  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    else window.location.href = "/dashboard";
    setLoading(false);
  }

  async function signUpWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else alert("Check your email for a confirmation link!");
    setLoading(false);
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100 p-6">
      <div className="w-full max-w-md bg-gray-900/70 backdrop-blur rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-center">Trade Secret</h1>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 py-3 rounded-md font-medium shadow hover:brightness-110 transition"
        >
          <FaGoogle className="text-lg" />
          Continue with Google
        </button>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-xs uppercase tracking-wide text-gray-400">
            or
          </span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        <form onSubmit={signInWithEmail} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800/60 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPass(e.target.value)}
            className="w-full bg-gray-800/60 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand to-brand-light text-white py-3 rounded-md font-semibold disabled:opacity-50"
          >
            {loading ? "Please wait…" : "Sign in"}
          </button>

          <button
            type="button"
            onClick={signUpWithEmail}
            className="w-full text-sm text-brand hover:underline pt-2"
          >
            Create a new account
          </button>
        </form>
      </div>
    </main>
  );
}
