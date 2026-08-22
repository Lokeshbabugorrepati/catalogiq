import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/upload", label: "Ingestion" },
  { to: "/insights", label: "Insights" },
];

export default function AppLayout() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-canvas">
      <aside className="w-60 shrink-0 bg-ink text-white flex flex-col">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-ink-line border-[#232B3D]">
          <div className="h-7 w-7 rounded-md bg-cobalt flex items-center justify-center font-display font-bold text-xs">
            C
          </div>
          <span className="font-display font-semibold">CatalogIQ</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-cobalt text-white" : "text-slate-300 hover:bg-white/5"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={toggleTheme}
          className="mx-3 mb-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-mono text-slate-300 hover:bg-white/5 transition"
        >
          {theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        </button>

        {/* User menu / logout */}
        <div className="m-3 mt-1 rounded-lg border border-white/10 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-full bg-cobalt flex items-center justify-center text-xs font-semibold shrink-0">
              {user?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.name || "Loading..."}</p>
              <p className="text-[10px] text-slate-400 truncate font-mono">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-md bg-white/5 hover:bg-risk/20 hover:text-risk text-slate-300 text-xs font-medium py-1.5 transition"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-blueprint-grid min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
