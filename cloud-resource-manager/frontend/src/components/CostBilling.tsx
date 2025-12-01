import React from "react";
import { Resource } from "../types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface Props {
  resources: Resource[];
}

const CostBilling: React.FC<Props> = ({ resources }) => {
  const inr = (n: number) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const totalMonthly = resources.reduce(
    (sum, r) => sum + (r.costPerMonth || 0),
    0
  );

  const byProvider: Record<string, number> = {};
  resources.forEach((r) => {
    byProvider[r.provider] =
      (byProvider[r.provider] || 0) + (r.costPerMonth || 0);
  });

  const providerCostData = Object.keys(byProvider).map((prov) => ({
    name: prov,
    cost: byProvider[prov],
  }));

  const topResources = [...resources]
    .filter((r) => r.costPerMonth)
    .sort((a, b) => (b.costPerMonth || 0) - (a.costPerMonth || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Cost & Billing
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          High-level view of your estimated monthly cloud spend.
        </p>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Monthly</p>
          <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">
            {inr(totalMonthly)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600">
            Within free-tier budgets for most AWS resources.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Providers</p>
          <p className="mt-2 text-xl font-semibold">
            {Object.keys(byProvider).length || 0}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            AWS is real; GCP & Azure currently use mock cost estimates.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">
            Highest Cost Resource
          </p>
          {topResources[0] ? (
            <>
              <p className="mt-2 text-sm font-semibold">
                {topResources[0].name}
              </p>
              <p className="text-xs text-slate-500">
                {topResources[0].provider} • {topResources[0].type}
              </p>
              <p className="mt-1 text-sm font-bold text-emerald-600">
                {inr(topResources[0].costPerMonth || 0)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-slate-400">
              No resources created yet.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* provider bar chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
            Monthly Spend by Provider
          </h3>
          {providerCostData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-slate-400">
              No cost data yet. Create some resources.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={providerCostData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => inr(Number(value))} />
                  <Legend />
                  <Bar
                    dataKey="cost"
                    name="Monthly Cost (₹)"
                    fill="#0ea5e9"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* top resources table */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            Top Cost Drivers
          </h3>
          {topResources.length === 0 ? (
            <p className="text-xs text-slate-400">
              No resources yet. Once you create real AWS resources, they’ll
              appear here with estimated cost.
            </p>
          ) : (
            <div className="space-y-2 text-xs">
              {topResources.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {r.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {r.provider} • {r.type} • {r.region}
                    </p>
                  </div>
                  <span className="font-semibold text-emerald-600">
                    {inr(r.costPerMonth || 0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CostBilling;