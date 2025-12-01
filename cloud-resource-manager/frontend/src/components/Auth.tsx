// src/components/Auth.tsx
import React, { useState } from "react";

type UserRole = "Admin" | "Developer" | "Viewer";

interface AuthProps {
  onLogin: (role: UserRole) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let role: UserRole | null = null;

    if (email === "admin@example.com" && password === "admin123") {
      role = "Admin";
    } else if (email === "dev@example.com" && password === "dev123") {
      role = "Developer";
    } else if (email === "viewer@example.com" && password === "viewer123") {
      role = "Viewer";
    }

    if (!role) {
      alert(
        "Invalid credentials.\n\nUse one of:\n" +
          "Admin:   admin@example.com / admin123\n" +
          "Dev:     dev@example.com / dev123\n" +
          "Viewer:  viewer@example.com / viewer123"
      );
      return;
    }

    onLogin(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
          Cloud Resource Manager
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Sign in with a demo account to explore Admin, Developer, or Viewer
          permissions.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Email
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 shadow-sm transition-colors"
          >
            Sign in
          </button>
        </form>

        <div className="mt-5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Demo accounts:
          </p>
          <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
            <li>
              <span className="font-semibold">Admin:</span>{" "}
              admin@example.com / admin123
            </li>
            <li>
              <span className="font-semibold">Developer:</span>{" "}
              dev@example.com / dev123
            </li>
            <li>
              <span className="font-semibold">Viewer:</span>{" "}
              viewer@example.com / viewer123
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Auth;
