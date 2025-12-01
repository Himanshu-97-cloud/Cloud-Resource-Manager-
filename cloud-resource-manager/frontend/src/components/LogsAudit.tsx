import React from "react";
import { LogEntry } from "../types";
import { Filter, Search } from "lucide-react";

interface Props {
  logs: LogEntry[];
}

const LogsAudit: React.FC<Props> = ({ logs }) => {
  const hasLogs = logs && logs.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Logs &amp; Audit
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track all resource create, update, and delete operations.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            className="w-full border-none bg-transparent text-sm text-slate-700 focus:outline-none dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder="Search by user, resource, or action… (UI only)"
          />
        </div>
        <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          <Filter className="h-3 w-3" /> All Status
        </button>
        <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          Last 7 Days
        </button>
      </div>

      {/* Table / Empty state */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {!hasLogs ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No actions recorded yet. Create or delete some resources to see logs
            here.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/70">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-300">
                  Timestamp
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-300">
                  User
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-300">
                  Action
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-300">
                  Resource
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-300">
                  Provider
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-100">
                    {log.user}
                  </td>
                  <td className="px-4 py-2 text-slate-700 dark:text-slate-100 capitalize">
                    {log.action}
                  </td>
                  <td className="px-4 py-2 text-blue-600 dark:text-blue-300">
                    {log.resource}
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300">
                      {log.provider}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        log.status === "Success"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30"
                          : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30"
                      }`}
                    >
                      ● {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LogsAudit;
