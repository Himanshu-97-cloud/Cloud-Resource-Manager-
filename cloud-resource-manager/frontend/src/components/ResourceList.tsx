// src/components/ResourceList.tsx
import React from "react";
import { Resource } from "../types";

type UserRole = "Admin" | "Developer" | "Viewer";

interface Props {
  title: string;
  resources: Resource[];
  onDelete: (id: number) => void;
  onUpdate: (id: number, patch: Partial<Resource>) => void;
  onOpenCreate: () => void;
  currentUserRole: UserRole;
}

const ResourceList: React.FC<Props> = ({
  title,
  resources,
  onDelete,
  onUpdate, // currently not used, but kept for future inline edits
  onOpenCreate,
  currentUserRole,
}) => {
  const createLabel =
    title === "Databases"
      ? "Create Database"
      : title === "Networks"
      ? "Create Network"
      : "Create Resource";

  const isAdmin = currentUserRole === "Admin";
  const isDeveloper = currentUserRole === "Developer";
  const isViewer = currentUserRole === "Viewer";

  const canCreate = !isViewer; // Admin + Developer can create, Viewer cannot
  const canDelete = isAdmin; // ONLY Admin can delete

  const handleDeleteClick = (id: number) => {
    if (!canDelete) {
      alert("Delete requires Admin access.");
      return;
    }
    if (!window.confirm("Delete this resource?")) return;
    onDelete(id);
  };

  const handleCreateClick = () => {
    if (!canCreate) {
      alert("Create requires Admin access.");
      return;
    }
    onOpenCreate();
  };

  return (
    <div className="space-y-4">
      {/* Header + create button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            {title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {title === "All Resources"
              ? "Manage all your resources across providers."
              : title === "Databases"
              ? "Manage your database instances."
              : "Manage your network / load balancer resources."}
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          disabled={!canCreate}
          title={
            canCreate
              ? createLabel
              : "Requires Admin access (Viewer cannot create resources)"
          }
          className={`rounded-lg px-4 py-2 text-xs font-semibold shadow-sm
            ${
              canCreate
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-slate-200 text-slate-500 cursor-not-allowed opacity-60"
            }`}
        >
          + {createLabel}
        </button>
      </div>

      {/* Table / empty state */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {resources.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No resources found in this view.{" "}
            {canCreate ? (
              <>
                Use the{" "}
                <span className="font-medium">{createLabel}</span> button to
                create one.
              </>
            ) : (
              <>You don&apos;t have permission to create new resources.</>
            )}
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Provider</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Region</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Cost (₹/mo)</th>
                <th className="px-6 py-3 text-right">
                  <span
                    className={
                      canDelete
                        ? ""
                        : "text-slate-400 dark:text-slate-500 opacity-70"
                    }
                    title={
                      canDelete
                        ? "Actions"
                        : "Delete requires Admin access (Developer / Viewer limited)"
                    }
                  >
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {resources.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-100">
                    {r.name}
                  </td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                    {r.provider}
                  </td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                    {r.type}
                  </td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">
                    {r.region}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium
                      ${
                        r.status === "Running"
                          ? "bg-green-50 text-green-700 border border-green-100 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/30"
                          : r.status === "Stopped"
                          ? "bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-700/40 dark:text-slate-200 dark:border-slate-600"
                          : "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30"
                      }`}
                    >
                      {r.status || "Unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-700 dark:text-slate-200">
                    {r.costPerMonth != null ? `₹${r.costPerMonth}` : "—"}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleDeleteClick(r.id as number)}
                      disabled={!canDelete}
                      title={
                        canDelete
                          ? "Delete resource"
                          : "Requires Admin access (Admin only)"
                      }
                      className={`text-xs font-medium
                        ${
                          canDelete
                            ? "text-red-500 hover:text-red-600"
                            : "text-red-300 cursor-not-allowed opacity-60"
                        }`}
                    >
                      Delete
                    </button>
                    {/* if later you add an Update/Edit button, you can check:
                        - Admin + Developer allowed
                        - Viewer disabled
                    */}
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

export default ResourceList;
