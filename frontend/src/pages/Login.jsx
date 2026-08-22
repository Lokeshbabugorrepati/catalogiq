import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import GoogleAuthButton from "../components/GoogleAuthButton";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/login", form);
      await refresh();
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT — pure brand presence, no product data */}
      <div className="hidden lg:flex relative bg-ink text-white flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-blueprint-grid opacity-30" />
        {/* soft radial glow for depth */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cobalt/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cobalt/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-cobalt flex items-center justify-center font-display font-bold text-sm">
            C
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">CatalogIQ</span>
        </div>

        {/* Abstract mark: a few nodes joined by dimension leader lines - the brand motif, not a literal screenshot */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <svg viewBox="0 0 320 220" className="w-full max-w-xs opacity-90">
            <path d="M40,170 C 90,170 90,110 150,110" className="leader-line" />
            <path d="M150,110 C 200,110 200,60 260,60" className="leader-line" />
            <path d="M150,110 C 190,110 190,170 240,170" className="leader-line" />

            <circle cx="40" cy="170" r="4" fill="#5B7CE6" />
            <circle cx="150" cy="110" r="5" fill="#FFFFFF" />
            <circle cx="260" cy="60" r="4" fill="#7FE0A0" />
            <circle cx="240" cy="170" r="4" fill="#F2B84B" />

            <circle cx="150" cy="110" r="10" fill="none" stroke="#2954D8" strokeWidth="1" opacity="0.6" />
            <circle cx="150" cy="110" r="16" fill="none" stroke="#2954D8" strokeWidth="1" opacity="0.3" />
          </svg>
        </div>

        <div className="relative z-10 max-w-sm">
          <p className="font-display text-2xl font-medium leading-snug">
            Structured. Verified.<br />Explainable.
          </p>
          <p className="mt-3 text-sm text-[#9AA3B2] leading-relaxed">
            CatalogIQ turns fragmented product data into clean, trustworthy catalog records — built for the UniHack challenge.
          </p>
        </div>
      </div>

      {/* RIGHT — login form */}
      <div className="flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-md bg-cobalt flex items-center justify-center font-display font-bold text-sm text-white">
              C
            </div>
            <span className="font-display font-semibold text-lg">CatalogIQ</span>
          </div>

          <p className="text-xs font-mono uppercase tracking-widest text-steel-dim text-[#9AA3B2] mb-2">
            Reviewer sign in
          </p>
          <h1 className="font-display text-2xl font-semibold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to continue reviewing and enriching catalog data.</p>

          <div className="mt-6">
            <GoogleAuthButton
              onSuccess={() => { refresh(); navigate("/dashboard"); }}
              onError={setError}
            />
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-steel" />
            <span className="text-xs font-mono text-slate-400">OR</span>
            <div className="h-px flex-1 bg-steel" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full rounded-lg border border-steel px-3 py-2.5 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20 transition"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1 w-full rounded-lg border border-steel px-3 py-2.5 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20 transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-risk bg-risk-soft border border-risk/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-ink text-white text-sm font-medium py-2.5 hover:bg-cobalt transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500 text-center">
            No account yet?{" "}
            <Link to="/register" className="text-cobalt font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
