// src/components/CreateResourceModal.tsx
import React, { useState } from "react";
import { Resource } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    provider: "AWS" | "GCP" | "Azure";
    type: Resource["type"];
    region: string;
  }) => void;
  // optional lock for Databases / Networks tabs
  lockType?: Resource["type"];
}

const CreateResourceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  lockType,
}) => {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState<"AWS" | "GCP" | "Azure">("AWS");
  const [type, setType] = useState<Resource["type"]>(lockType || "VM");

  // Region locked to Mumbai
  const region = "ap-south-1";

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      provider,
      type,
      region, // always ap-south-1
    });

    setName("");
    setProvider("AWS");
    setType(lockType || "VM");
  };

  const handleTypeChange = (value: Resource["type"]) => {
    if (lockType) return; // don't allow change when locked
    setType(value);
  };

  const isTypeDisabled = !!lockType;

  const typeOptions: Resource["type"][] = [
    "VM",
    "Storage",
    "Database",
    "Load Balancer",
    "Serverless",
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:text-slate-50">
        <h2 className="mb-1 text-lg font-semibold">
          {lockType === "Database"
            ? "Create Database"
            : lockType === "Load Balancer"
            ? "Create Network"
            : "Create Resource"}
        </h2>
        <p className="mb-4 text-xs text-slate-500">
          All resources are provisioned in{" "}
          <strong>ap-south-1 (Mumbai)</strong> for free-tier safety.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Name
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
              placeholder="e.g. app-server-01"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Provider */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Cloud Provider
            </label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              value={provider}
              onChange={(e) =>
                setProvider(e.target.value as "AWS" | "GCP" | "Azure")
              }
            >
              <option value="AWS">AWS</option>
              <option value="Azure">Azure (mock)</option>
              <option value="GCP">GCP (mock)</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Resource Type
            </label>
            <select
              className={`mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 ${
                isTypeDisabled ? "cursor-not-allowed opacity-70" : ""
              }`}
              value={type}
              onChange={(e) =>
                handleTypeChange(e.target.value as Resource["type"])
              }
              disabled={isTypeDisabled}
            >
              {typeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {lockType && (
              <p className="mt-1 text-[11px] text-slate-400">
                Type is locked to <b>{lockType}</b> in this section.
              </p>
            )}
          </div>

          {/* Region (read-only) */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Region
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
              value="ap-south-1 (Mumbai) — locked"
              readOnly
            />
          </div>

          {/* Actions */}
          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              {lockType === "Database"
                ? "Create Database"
                : lockType === "Load Balancer"
                ? "Create Network"
                : "Create Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateResourceModal;
