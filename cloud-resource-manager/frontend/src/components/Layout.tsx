// src/components/Layout.tsx
import React from "react";
import {
  LayoutDashboard,
  Server,
  Database,
  Share2,
  Activity,
  DollarSign,
  FileText,
  Shield,
  Settings as SettingsIcon,
  SunMedium,
  MoonStar,
} from "lucide-react";

import { Alert, User } from "../types";

type TabId =
  | "dashboard"
  | "resources"
  | "databases"
  | "networks"
  | "monitoring"
  | "cost"
  | "logs"
  | "rbac"
  | "settings";

interface LayoutProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentUser: User;
  alerts?: Alert[];
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  activeTab,
  onTabChange,
  isDarkMode,
  toggleDarkMode,
  currentUser,
  alerts = [],
  onLogout,
  children,
}) => {
  const criticalCount = alerts.filter((a) => a.severity === "Critical").length;

  const NavItem = ({
    id,
    icon: Icon,
    label,
    section,
  }: {
    id: TabId;
    icon: React.ElementType;
    label: string;
    section?: "overview" | "resources" | "management" | "system";
  }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => onTabChange(id)}
        className={`flex items-center w-full px-4 py-2.5 text-sm rounded-xl mb-1 transition-colors
        ${
          isActive
            ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"
            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        }`}
      >
        <Icon
          size={18}
          className={`mr-3 ${
            isActive ? "text-blue-500 dark:text-blue-300" : "text-slate-400"
          }`}
        />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      {/* SIDEBAR */}
      <aside className="w-64 flex flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {/* Top brand + dark toggle */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Cloud Manager
            </div>
            <div className="text-[11px] text-slate-400">
              Multi-cloud resource console
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {isDarkMode ? <SunMedium size={16} /> : <MoonStar size={16} />}
          </button>
        </div>

        {/* Nav sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          <div>
            <p className="px-2 text-[11px] font-semibold tracking-wide text-slate-400">
              OVERVIEW
            </p>
            <div className="mt-2">
              <NavItem
                id="dashboard"
                icon={LayoutDashboard}
                label="Dashboard"
              />
            </div>
          </div>

          <div>
            <p className="px-2 text-[11px] font-semibold tracking-wide text-slate-400">
              RESOURCES
            </p>
            <div className="mt-2">
              <NavItem id="resources" icon={Server} label="All Resources" />
              <NavItem id="databases" icon={Database} label="Databases" />
              <NavItem id="networks" icon={Share2} label="Networks" />
            </div>
          </div>

          <div>
            <p className="px-2 text-[11px] font-semibold tracking-wide text-slate-400">
              MANAGEMENT
            </p>
            <div className="mt-2">
              <NavItem id="monitoring" icon={Activity} label="Monitoring" />
              <NavItem id="cost" icon={DollarSign} label="Cost & Billing" />
              <NavItem id="logs" icon={FileText} label="Logs & Audit" />
              <NavItem id="rbac" icon={Shield} label="RBAC / Access" />
            </div>
          </div>

          <div>
            <p className="px-2 text-[11px] font-semibold tracking-wide text-slate-400">
              SYSTEM
            </p>
            <div className="mt-2">
              <NavItem id="settings" icon={SettingsIcon} label="Settings" />
            </div>
          </div>
        </div>

        {/* User footer */}
        <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-8 w-8 rounded-full"
            />
            <div>
              <div className="font-medium text-slate-800 dark:text-slate-50">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-400">
                {currentUser.role} •{" "}
                {criticalCount > 0 ? "Issues" : "All green"}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-[11px] font-medium text-red-500 hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
