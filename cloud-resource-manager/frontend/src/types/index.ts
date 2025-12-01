// Shared TypeScript types
export interface Resource {
  id: number;
  name: string;
  provider: string;
  type: string;
  region: string;
  status: string;
  cpu?: string | null;
  memory?: string | null;
  storage?: string | null;
  costPerMonth: number;
  uptime?: number;
  tags?: string[];
}

export interface Alert {
  id: string;
  title: string;
  severity: string;
  time: string;
}

export type UserRole = "Admin" | "Developer" | "Viewer";

export interface User {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  avatar: string;
  lastLogin: string;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: string;
  provider: string;
}

export interface MetricData {
  time: string;
  cpu: number;
  memory: number;
  networkIn: number;
  networkOut: number;
}
