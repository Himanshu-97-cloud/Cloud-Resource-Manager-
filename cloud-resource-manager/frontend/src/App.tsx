// App.tsx

import React, { useEffect, useState } from "react";

import Layout from "./components/Layout";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import ResourceList from "./components/ResourceList";
import Monitoring from "./components/Monitoring";
import CostBilling from "./components/CostBilling";
import LogsAudit from "./components/LogsAudit";
import AccessControl from "./components/AccessControl";
import Settings from "./components/Settings";
import CreateResourceModal from "./components/CreateResourceModal";

import {
  fetchResources,
  fetchAlerts,
  fetchUsers,
  fetchLogs,
  createResource,
  deleteResource,
  updateResource,
  fetchMetrics,
} from "./services/api";

import { Alert, LogEntry, MetricData, Resource, User } from "./types";

// Tab IDs MUST match your Layout.tsx nav ids:
//   "dashboard", "resources", "databases", "networks", "monitoring",
//   "cost", "logs", "rbac", "settings"
type TabId =
  | "dashboard"
  | "resources" // All Resources
  | "databases"
  | "networks" // Load Balancers
  | "monitoring"
  | "cost"
  | "logs"
  | "rbac"
  | "settings";

type UserRole = "Admin" | "Developer" | "Viewer";

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [resources, setResources] = useState<Resource[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<MetricData[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [lockedType, setLockedType] = useState<Resource["type"] | null>(null);

  // role selected at login (Admin / Developer / Viewer)
  const [loggedInRole, setLoggedInRole] = useState<UserRole | null>(null);

  // ---------- Dark mode on full page ----------
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // ---------- Load initial data AFTER login ----------
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadAll = async () => {
      try {
        setLoading(true);
        const [resList, alertList, userList, logList] = await Promise.all([
          fetchResources(),
          fetchAlerts(),
          fetchUsers(),
          fetchLogs(),
        ]);

        setResources(resList || []);
        setAlerts(alertList || []);
        setUsers(userList || []);
        setLogs(logList || []);

        // we still keep backend users for RBAC table, but
        // loggedInRole decides permissions
        if (userList && userList.length > 0) {
          setCurrentUser(userList[0]);
        }

        setError(null);
      } catch (e) {
        console.error(e);
        setError(
          "Failed to load data from backend. Please check your API server."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [isAuthenticated]);

  // ---------- Effective user info based on loggedInRole ----------
  const effectiveRole: UserRole = loggedInRole || "Admin";

  const effectiveUser: User = {
    id: "local-user",
    name:
      effectiveRole === "Admin"
        ? "Cloud Admin"
        : effectiveRole === "Developer"
        ? "Cloud Developer"
        : "Cloud Viewer",
    email:
      effectiveRole === "Admin"
        ? "admin@example.com"
        : effectiveRole === "Developer"
        ? "dev@example.com"
        : "viewer@example.com",
    role: effectiveRole,
    status: "Active",
    lastLogin: new Date().toISOString(),
    avatar: "https://picsum.photos/80/80",
  };

  const currentRole: UserRole = effectiveRole;

  // ---------- Metrics: when Monitoring tab opens ----------
  useEffect(() => {
    const loadMetrics = async () => {
      if (!isAuthenticated) return;
      if (activeTab !== "monitoring") return;

      const firstVm = resources.find(
        (r) =>
          r.type === "VM" &&
          (r.provider === "AWS" ||
            r.provider === "GCP" ||
            r.provider === "Azure")
      );
      if (!firstVm) {
        setMetrics([]);
        return;
      }
      try {
        const data = await fetchMetrics(firstVm.id);
        setMetrics(data || []);
      } catch (e) {
        console.error(e);
      }
    };

    loadMetrics();
  }, [activeTab, resources, isAuthenticated]);

  // ---------- Auth ----------
  const handleLogin = (role: UserRole) => {
    setLoggedInRole(role);
    setIsAuthenticated(true);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoggedInRole(null);
    setResources([]);
    setAlerts([]);
    setUsers([]);
    setLogs([]);
    setMetrics([]);
    setCurrentUser(null);
    setActiveTab("dashboard");
  };

  // ---------- CRUD handlers with simple RBAC ----------

  const handleCreateOpenAll = () => {
    if (currentRole === "Viewer") {
      alert("Create requires Admin access.");
      return;
    }
    setLockedType(null); // allow all types
    setIsCreateOpen(true);
  };

  const handleCreateOpenDatabase = () => {
    if (currentRole === "Viewer") {
      alert("Create requires Admin access.");
      return;
    }
    setLockedType("Database");
    setIsCreateOpen(true);
  };

  const handleCreateOpenNetwork = () => {
    if (currentRole === "Viewer") {
      alert("Create requires Admin access.");
      return;
    }
    setLockedType("Load Balancer");
    setIsCreateOpen(true);
  };

  const handleCreate = async (data: any) => {
    if (currentRole === "Viewer") {
      alert("Create requires Admin access.");
      return;
    }

    try {
      const created = await createResource(data);
      setResources((prev) => [...prev, created]);

      const logList = await fetchLogs();
      setLogs(logList || []);
    } catch (e) {
      console.error(e);
      alert("Failed to create resource. Check backend logs.");
    } finally {
      setIsCreateOpen(false);
      setLockedType(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (currentRole !== "Admin") {
      alert("Delete requires Admin access.");
      return;
    }

    if (!window.confirm("Delete this resource?")) return;
    try {
      await deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
      const logList = await fetchLogs();
      setLogs(logList || []);
    } catch (e) {
      console.error(e);
      alert("Failed to delete resource. Check backend logs.");
    }
  };

  const handleUpdate = async (id: number, patch: Partial<Resource>) => {
    if (currentRole === "Viewer") {
      alert("Update requires Admin or Developer access.");
      return;
    }

    try {
      const updated = await updateResource(id, patch);
      setResources((prev) => prev.map((r) => (r.id === id ? updated : r)));
      const logList = await fetchLogs();
      setLogs(logList || []);
    } catch (e) {
      console.error(e);
      alert("Failed to update resource.");
    }
  };

  const totalCost = resources.reduce(
    (sum, r) => sum + (r.costPerMonth || 0),
    0
  );

  // ---------- Tab content ----------
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="px-4 py-2 rounded-lg bg-white shadow border border-slate-200 text-sm text-slate-600">
            Loading your cloud resources…
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            resources={resources}
            alerts={alerts}
            totalCost={totalCost}
          />
        );

      case "resources":
        return (
          <ResourceList
            title="All Resources"
            resources={resources}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onOpenCreate={handleCreateOpenAll}
            currentUserRole={currentRole}
          />
        );

      case "databases": {
        const dbs = resources.filter((r) => r.type === "Database");
        return (
          <ResourceList
            title="Databases"
            resources={dbs}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onOpenCreate={handleCreateOpenDatabase}
            currentUserRole={currentRole}
          />
        );
      }

      case "networks": {
        const lbs = resources.filter((r) => r.type === "Load Balancer");
        return (
          <ResourceList
            title="Networks"
            resources={lbs}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onOpenCreate={handleCreateOpenNetwork}
            currentUserRole={currentRole}
          />
        );
      }

      case "monitoring":
        return <Monitoring metrics={metrics} />;

      case "cost":
        return <CostBilling resources={resources} />;

      case "logs":
        return <LogsAudit logs={logs} />;

      case "rbac":
        return <AccessControl users={users} />;

      case "settings":
        return <Settings currentUser={effectiveUser} />;

      default:
        return null;
    }
  };

  // ---------- Show login page until authenticated ----------
  if (!isAuthenticated) {
    return (
      <div className={isDarkMode ? "dark" : ""}>
        <Auth onLogin={handleLogin} />
      </div>
    );
  }

  // ---------- Main layout ----------
  return (
    <Layout
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as TabId)}
      isDarkMode={isDarkMode}
      toggleDarkMode={() => setIsDarkMode((prev) => !prev)}
      currentUser={effectiveUser}
      alerts={alerts}
      onLogout={handleLogout}
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {renderContent()}

      <CreateResourceModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setLockedType(null);
        }}
        onSubmit={handleCreate}
        lockType={lockedType || undefined}
      />
    </Layout>
  );
}

export default App;
