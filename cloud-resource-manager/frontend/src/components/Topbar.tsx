import React from "react";
import { Moon, Sun } from "lucide-react";
import { User } from "../types";

interface TopbarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentUser: User;
  onLogout: () => void;
}

const Topbar: React.FC<TopbarProps> = ({
  isDarkMode,
  toggleDarkMode,
  currentUser,
  onLogout,
}) => {
  return (
    <header
      className={`
      h-16 ml-64 px-6 flex items-center justify-between border-b 
      ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}
      `}
    >
      <div className="font-semibold text-lg text-slate-800 dark:text-white">
        Welcome, {currentUser.name}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          onClick={onLogout}
          className="px-3 py-1 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
