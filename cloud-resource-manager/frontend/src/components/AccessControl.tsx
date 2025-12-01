import React from "react";
import { User } from "../types";

interface Props {
  users: User[];
}

const AccessControl: React.FC<Props> = ({ users }) => {
  const hasUsers = users && users.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          RBAC / Access Control
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          View who can manage cloud resources. (Auth is simplified for this
          demo.)
        </p>
      </div>

      {/* Banner */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800 shadow-sm dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-200">
        <span className="font-semibold">Admin privileges required.</span>{" "}
        You are viewing this page as{" "}
        <span className="font-semibold">Admin</span>. Changes made here would
        affect user access immediately.
      </div>

      {/* Users table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {!hasUsers ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No users found. Backend will auto-create a default Admin user on
            first load.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/70">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-300">
                  User
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-300">
                  Role
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-300">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-300">
                  Last login
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar || "https://picsum.photos/80/80"}
                        alt={u.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {u.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        u.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30"
                          : "bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-700/40 dark:text-slate-200 dark:border-slate-600"
                      }`}
                    >
                      {u.status || "Unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
                    {u.lastLogin
                      ? new Date(u.lastLogin).toLocaleString()
                      : "—"}
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

export default AccessControl;
