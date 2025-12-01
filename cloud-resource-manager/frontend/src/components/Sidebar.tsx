import React from "react";
import { 
  LayoutDashboard, Cloud, Database, Network, 
  Activity, Wallet, FileText, Shield, Settings 
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  isDarkMode: boolean;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "resources", label: "Compute", icon: Cloud },
  { id: "databases", label: "Databases", icon: Database },
  { id: "networks", label: "Load Balancers", icon: Network },
  { id: "monitoring", label: "Monitoring", icon: Activity },
  { id: "cost", label: "Cost & Billing", icon: Wallet },
  { id: "logs", label: "Logs", icon: FileText },
  { id: "rbac", label: "Access Control", icon: Shield },
  { id: "settings", label: "Settings", icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isDarkMode }) => {
  return (
    <aside className={`w-64 h-screen fixed top-0 left-0 border-r
      ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
      
      <h1 className="text-xl font-bold px-6 py-5 pb-6 
        text-blue-600 border-b border-slate-200 dark:border-slate-800">
        Cloud Manager
      </h1>

      <nav className="mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                flex items-center px-6 py-3 w-full text-left transition 
                ${isActive 
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" 
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}
              `}
            >
              <Icon size={18} className="mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
