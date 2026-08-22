import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import GoogleAuthButton from "../components/GoogleAuthButton";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      await refresh();
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blueprint-grid p-6">
      <div className="w-full max-w-sm bg-surface border border-steel rounded-2xl shadow-card p-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-md bg-cobalt flex items-center justify-center font-display font-bold text-sm text-white">
            C
          </div>
          <span className="font-display font-semibold text-lg">CatalogIQ</span>
        </div>

        <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Start reviewing and enriching product catalog data.</p>

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
            <label className="text-xs font-medium text-slate-600">Full name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-steel px-3 py-2.5 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20 transition"
              placeholder="Jane Doe"
            />
          </div>
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
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full rounded-lg border border-steel px-3 py-2.5 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20 transition"
              placeholder="At least 6 characters"
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-cobalt font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
