// src/components/Dashboard.tsx
import React from "react";
import { Resource, Alert } from "../types";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  AlertTriangle,
  Server,
  DollarSign,
  Activity,
  CheckCircle,
} from "lucide-react";

interface DashboardProps {
  resources: Resource[];
  alerts: Alert[];
  totalCost: number;
}

const PROVIDER_COLORS: Record<string, string> = {
  AWS: "#f97316", // orange
  Azure: "#0ea5e9", // light blue
  GCP: "#22c55e", // green
  Other: "#94a3b8",
};

const Dashboard: React.FC<DashboardProps> = ({
  resources,
  alerts,
  totalCost,
}) => {
  // ---- basic stats ----
  const activeResources = resources.filter((r) => r.status === "Running").length;
  const idleResources = resources.filter(
    (r) => r.status === "Stopped" || r.status === "Unknown"
  ).length;

  // ---- provider distribution for pie chart ----
  const providerData = ["AWS", "Azure", "GCP"].map((p) => ({
    name: p,
    value: resources.filter((r) => r.provider === p).length,
  })).filter((d) => d.value > 0);

  // ---- cost vs budget data (INR) ----
  const costByProvider: Record<string, number> = {};
  resources.forEach((r) => {
    if (!r.costPerMonth) return;
    costByProvider[r.provider] =
      (costByProvider[r.provider] || 0) + (r.costPerMonth || 0);
  });

  const costData = Object.keys(costByProvider).map((prov) => ({
    name: prov,
    cost: costByProvider[prov],
    // simple budget rule: 1.5x of current spend, min 1000
    budget: Math.max(costByProvider[prov] * 1.5, 1000),
  }));

  const inr = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const StatCard = ({
    title,
    value,
    subtext,
    icon: Icon,
    colorClass,
    trend,
  }: any) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
            {value}
          </h3>
        </div>
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
      {subtext && (
        <div className="mt-4 flex items-center text-xs">
          {trend === "up" ? (
            <span className="text-green-500 font-bold mr-1">↑ 12%</span>
          ) : trend === "down" ? (
            <span className="text-red-500 font-bold mr-1">↓ 5%</span>
          ) : null}
          <span className="text-slate-400">{subtext}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time insight into your multi-cloud infrastructure.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <span className="flex items-center text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full border border-green-200">
            <CheckCircle size={12} className="mr-1" /> All Systems Operational
          </span>
        </div>
      </div>

      {/* stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Resources"
          value={resources.length}
          subtext={`${activeResources} Active, ${
            resources.length - activeResources
          } Stopped`}
          icon={Server}
          colorClass="bg-blue-500"
          trend="up"
        />
        <StatCard
          title="Est. Monthly Cost"
          value={inr(totalCost)}
          subtext="Projected to stay within budget"
          icon={DollarSign}
          colorClass="bg-emerald-500"
          trend="down"
        />
        <StatCard
          title="Active Alerts"
          value={alerts.length}
          subtext={`${alerts.filter((a) => a.severity === "Critical").length} Critical`}
          icon={AlertTriangle}
          colorClass="bg-red-500"
        />
        <StatCard
          title="Idle Resources"
          value={idleResources}
          subtext="Optimization opportunity detected"
          icon={Activity}
          colorClass="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* provider distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-1">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
            Provider Distribution
          </h3>
          {providerData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-slate-400">
              No resources yet.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={providerData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {providerData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          PROVIDER_COLORS[entry.name] || PROVIDER_COLORS["Other"]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* cost vs budget */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
            Cost vs. Budget (Current Month)
          </h3>
          {costData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-slate-400">
              No cost data yet. Create some resources to see this chart.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={costData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    width={60}
                  />
                  <Tooltip
                    formatter={(value: any) => inr(Number(value))}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend
                    wrapperStyle={{ color: "#0f172a", fontSize: 12 }}
                  />
                  {/* 🎨 COLORS CHANGED HERE */}
                  <Bar
                    dataKey="cost"
                    name="Current Spend (₹)"
                    fill="#3b82f6"          // blue
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                  />
                  <Bar
                    dataKey="budget"
                    name="Allocated Budget (₹)"
                    fill="#a855f7"          // violet
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* recent alerts */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            Recent Alerts
          </h3>
          <button className="text-blue-600 text-sm hover:underline">
            View All
          </button>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {alerts.length === 0 ? (
            <div className="px-6 py-8 text-sm text-slate-400">
              No alerts at the moment. Your infrastructure looks healthy.
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${
                      alert.severity === "Critical"
                        ? "bg-red-100 text-red-600"
                        : alert.severity === "Warning"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {alert.title}
                    </p>
                    <p className="text-xs text-slate-500">{alert.time}</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    alert.severity === "Critical"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : alert.severity === "Warning"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {alert.severity}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;