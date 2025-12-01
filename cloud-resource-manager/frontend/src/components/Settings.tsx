import React, { useState } from "react";
import { User } from "../types";

interface Props {
  currentUser: User;
}

type SettingsTab = "profile" | "security" | "integrations" | "notifications";

const Settings: React.FC<Props> = ({ currentUser }) => {
  const [tab, setTab] = useState<SettingsTab>("profile");

  const TabButton = ({
    id,
    label,
    icon,
  }: {
    id: SettingsTab;
    label: string;
    icon: React.ReactNode;
  }) => {
    const active = tab === id;
    return (
      <button
        onClick={() => setTab(id)}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors
        ${
          active
            ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200"
            : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/70"
        }`}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your account preferences and cloud integrations.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px,1fr]">
        {/* Left tabs */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="space-y-1">
            <TabButton
              id="profile"
              label="Profile & Account"
              icon={
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                  P
                </span>
              }
            />
            <TabButton
              id="security"
              label="Security & Access"
              icon={
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                  S
                </span>
              }
            />
            <TabButton
              id="integrations"
              label="Cloud Integrations"
              icon={
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                  C
                </span>
              }
            />
            <TabButton
              id="notifications"
              label="Notifications"
              icon={
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                  N
                </span>
              }
            />
          </div>
        </div>

        {/* Right panel */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {tab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Public Profile
              </h2>

              <div className="flex flex-wrap items-center gap-4">
                <img
                  src={currentUser.avatar || "https://picsum.photos/96/96"}
                  alt={currentUser.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
                    Change Avatar
                  </button>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    JPG or PNG. Max 1MB.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Full Name
                  </label>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                    {currentUser.name}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Email Address
                  </label>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                    {currentUser.email}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Job Title
                  </label>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                    Cloud / DevOps Engineer
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Timezone
                  </label>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                    Asia / Kolkata
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {tab === "security" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Security & Access
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                For this demo, authentication is simplified. In a real system,
                this section would manage passwords, MFA, API keys, and audit
                logs for security changes.
              </p>
            </div>
          )}

          {tab === "integrations" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Cloud Integrations
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Connect AWS, Azure, and GCP accounts here. This demo uses your
                local AWS credentials and mock data for other providers.
              </p>
            </div>
          )}

          {tab === "notifications" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Notifications
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Configure email or Slack alerts for cost anomalies, failed
                deployments, or unhealthy resources.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
