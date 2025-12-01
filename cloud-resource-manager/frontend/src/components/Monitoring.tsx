import React from "react";
import { MetricData } from "../types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface Props {
  metrics: MetricData[];
}

const Monitoring: React.FC<Props> = ({ metrics }) => {
  const hasData = metrics && metrics.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">
            Monitoring
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Live performance metrics for your compute resources.
          </p>
        </div>
        <p className="text-xs text-slate-400">
          Data points loaded: {metrics.length}
        </p>
      </div>

      {!hasData && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
          No metrics available yet. Select a VM resource (AWS, GCP, or Azure)
          and wait for metrics collection to start.
        </div>
      )}

      {hasData && (
        <>
          {/* CPU Utilization */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-md font-semibold text-slate-800 dark:text-white mb-3">
              CPU Utilization (%)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    className="dark:stroke-slate-700"
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10 }}
                    minTickGap={20}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cpu"
                    name="CPU"
                    stroke="#3b82f6"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-md font-semibold text-slate-800 dark:text-white mb-3">
              Memory Usage (%)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    className="dark:stroke-slate-700"
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10 }}
                    minTickGap={20}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="memory"
                    name="Memory"
                    stroke="#22c55e"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Network traffic */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-md font-semibold text-slate-800 dark:text-white mb-3">
              Network Traffic (bytes)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    className="dark:stroke-slate-700"
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10 }}
                    minTickGap={20}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="networkIn"
                    name="Network In"
                    stroke="#6366f1"
                    dot={false}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="networkOut"
                    name="Network Out"
                    stroke="#f97316"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Monitoring;
