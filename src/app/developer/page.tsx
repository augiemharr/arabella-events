"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { DEFAULT_SITE_CONTROL, SiteControlConfig } from "@/components/SiteLockGuard";
import { PaymentSubmission } from "@/components/AdminPaymentModal";
import DevGuard from "@/components/DevGuard";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  env: "production" | "test";
  permission: "read" | "write" | "admin";
  created_at: string;
  last_used: string;
}

interface WebhookSub {
  id: string;
  url: string;
  events: string[];
  status: "active" | "paused";
  secret: string;
  created_at: string;
}

interface WebhookLog {
  id: string;
  event: string;
  url: string;
  status: number;
  statusText: string;
  latencyMs: number;
  timestamp: string;
  payload: Record<string, unknown>;
}

interface SystemLog {
  id: string;
  level: "INFO" | "WARN" | "ERROR" | "DATABASE";
  message: string;
  timestamp: string;
}

const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: "key-1",
    name: "Main Production Key",
    key: "arb_live_9f82d1c4e72049b2a188f610a2",
    env: "production",
    permission: "admin",
    created_at: "2026-08-01 10:00:00",
    last_used: "Just now",
  },
  {
    id: "key-2",
    name: "Frontend Analytics Client",
    key: "arb_test_3b8192a0e4198275c120938f2a",
    env: "test",
    permission: "read",
    created_at: "2026-08-05 14:30:00",
    last_used: "5 mins ago",
  },
];

const INITIAL_WEBHOOKS: WebhookSub[] = [
  {
    id: "wh-1",
    url: "https://api.example.com/webhooks/arabella-events",
    events: ["booking.created", "deposit.paid"],
    status: "active",
    secret: "whsec_98a7f6e5d4c3b2a1",
    created_at: "2026-08-02",
  },
];

const ENDPOINTS = [
  {
    id: "health",
    method: "GET",
    path: "/api/v1/health",
    title: "System & DB Health Check",
    description: "Returns health status, DB latency, uptime, and database count metrics.",
    params: [],
    body: null,
  },
  {
    id: "list-bookings",
    method: "GET",
    path: "/api/v1/bookings",
    title: "List Event Bookings",
    description: "Retrieve all event bookings with optional filtering by status and limit.",
    params: [
      { key: "status", default: "", placeholder: "new, confirmed, completed..." },
      { key: "limit", default: "10", placeholder: "10" },
    ],
    body: null,
  },
  {
    id: "create-booking",
    method: "POST",
    path: "/api/v1/bookings",
    title: "Create Event Inquiry/Booking",
    description: "Submit a new event inquiry into the database.",
    params: [],
    body: JSON.stringify(
      {
        name: "Samantha Lopez",
        email: "samantha.lopez@example.com",
        phone: "+63 917 123 4567",
        event_type: "Wedding",
        event_date: "2026-12-15",
        pax: 120,
        message: "Inquiring for venue pricing and decor options.",
      },
      null,
      2
    ),
  },
  {
    id: "get-booking",
    method: "GET",
    path: "/api/v1/bookings/{id}",
    title: "Get Booking Details",
    description: "Retrieve complete details for a specific booking by UUID.",
    params: [{ key: "id", default: "sample-uuid-here", placeholder: "Booking UUID" }],
    body: null,
  },
  {
    id: "update-booking",
    method: "PATCH",
    path: "/api/v1/bookings/{id}",
    title: "Update Booking Status/Notes",
    description: "Update status, notes, or payment amounts for a booking.",
    params: [{ key: "id", default: "sample-uuid-here", placeholder: "Booking UUID" }],
    body: JSON.stringify(
      {
        status: "confirmed",
        deposit_amount: 15000,
        total_amount: 50000,
        deposit_paid: true,
        notes: "Deposit verified via bank transfer.",
      },
      null,
      2
    ),
  },
  {
    id: "gallery-list",
    method: "GET",
    path: "/api/v1/gallery",
    title: "List Gallery Photos",
    description: "Fetch public venue and setup photos sorted by order.",
    params: [{ key: "category", default: "", placeholder: "Venue, Setup, Catering..." }],
    body: null,
  },
];

export default function DeveloperHub() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "api" | "keys" | "webhooks" | "database" | "logs" | "billing"
  >("overview");

  const [siteControl, setSiteControl] = useState<SiteControlConfig>(DEFAULT_SITE_CONTROL);
  const [siteControlSaved, setSiteControlSaved] = useState(false);

  // Health Metrics
  const [sysHealth, setSysHealth] = useState<{
    status: string;
    dbStatus: string;
    latency: number;
    bookingsCount: number;
    uptime: number;
  }>({
    status: "checking",
    dbStatus: "checking",
    latency: 0,
    bookingsCount: 0,
    uptime: 0,
  });

  // API Explorer State
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  const [explorerParams, setExplorerParams] = useState<Record<string, string>>({});
  const [explorerBody, setExplorerBody] = useState("");
  const [apiResponse, setApiResponse] = useState<Record<string, unknown> | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [codeLang, setCodeLang] = useState<"curl" | "fetch" | "supabase" | "python" | "node">("curl");
  const [copiedCode, setCopiedCode] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(INITIAL_API_KEYS);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyEnv, setNewKeyEnv] = useState<"production" | "test">("production");
  const [newKeyPerm, setNewKeyPerm] = useState<"read" | "write" | "admin">("admin");
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  // Webhooks State
  const [webhooks, setWebhooks] = useState<WebhookSub[]>(INITIAL_WEBHOOKS);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [showWhModal, setShowWhModal] = useState(false);
  const [newWhUrl, setNewWhUrl] = useState("");
  const [newWhEvents, setNewWhEvents] = useState<string[]>(["booking.created"]);
  const [whTesting, setWhTesting] = useState(false);

  // Database Inspector State
  const [selectedDbTable, setSelectedDbTable] = useState<"bookings" | "gallery">("bookings");
  const [dbRows, setDbRows] = useState<Record<string, unknown>[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [customSqlQuery, setCustomSqlQuery] = useState("SELECT * FROM bookings ORDER BY created_at DESC LIMIT 10;");

  // System Logs State
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [logFilter, setLogFilter] = useState<"ALL" | "INFO" | "WARN" | "ERROR" | "DATABASE">("ALL");

  // Payment Submissions State
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmission[]>([]);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedKeys = localStorage.getItem("arb_dev_api_keys");
      if (savedKeys) setApiKeys(JSON.parse(savedKeys));
      const savedWh = localStorage.getItem("arb_dev_webhooks");
      if (savedWh) setWebhooks(JSON.parse(savedWh));
      const savedControl = localStorage.getItem("arb_site_control");
      if (savedControl) setSiteControl(JSON.parse(savedControl));
      const savedPay = localStorage.getItem("arb_payment_submissions");
      if (savedPay) setPaymentSubmissions(JSON.parse(savedPay));
    } catch {
      // Ignore fallback
    }
  }, []);

  const verifyPayment = (id: string) => {
    const updatedSubs = paymentSubmissions.map((s) =>
      s.id === id ? { ...s, status: "verified" as const } : s
    );
    setPaymentSubmissions(updatedSubs);

    // Calculate next due date +1 month
    const curDate = new Date(siteControl.dueDate || "2026-09-01");
    curDate.setMonth(curDate.getMonth() + 1);
    const nextDueDateStr = curDate.toISOString().slice(0, 10);

    const updatedControl: SiteControlConfig = {
      ...siteControl,
      status: "active",
      paymentStatus: "paid",
      dueDate: nextDueDateStr,
    };
    setSiteControl(updatedControl);

    try {
      localStorage.setItem("arb_payment_submissions", JSON.stringify(updatedSubs));
      localStorage.setItem("arb_site_control", JSON.stringify(updatedControl));
    } catch {
      // ignore
    }
    addLog("INFO", `✓ Verified Payment (ID: ${id}). Next due date advanced to ${nextDueDateStr}`);
  };

  const rejectPayment = (id: string) => {
    const updatedSubs = paymentSubmissions.map((s) =>
      s.id === id ? { ...s, status: "rejected" as const } : s
    );
    setPaymentSubmissions(updatedSubs);
    try {
      localStorage.setItem("arb_payment_submissions", JSON.stringify(updatedSubs));
    } catch {
      // ignore
    }
    addLog("WARN", `✗ Rejected Payment submission (ID: ${id})`);
  };

  const saveSiteControl = (updated: SiteControlConfig) => {
    setSiteControl(updated);
    try {
      localStorage.setItem("arb_site_control", JSON.stringify(updated));
    } catch {
      // ignore
    }
    setSiteControlSaved(true);
    setTimeout(() => setSiteControlSaved(false), 2500);
    addLog("WARN", `Updated Site Control Status: ${updated.status.toUpperCase()} (Payment: ${updated.paymentStatus})`);
  };

  // Sync health check on mount
  useEffect(() => {
    fetchHealth();
    addLog("INFO", "Developer Portal initialized");
  }, []);

  // Sync endpoint params/body when endpoint changes
  useEffect(() => {
    const initParams: Record<string, string> = {};
    selectedEndpoint.params.forEach((p) => {
      initParams[p.key] = p.default;
    });
    setExplorerParams(initParams);
    setExplorerBody(selectedEndpoint.body || "");
    setApiResponse(null);
    setResponseStatus(null);
  }, [selectedEndpoint]);

  const addLog = (level: "INFO" | "WARN" | "ERROR" | "DATABASE", message: string) => {
    const newLog: SystemLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      level,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  const fetchHealth = async () => {
    addLog("INFO", "Ping health check endpoint /api/v1/health...");
    const start = Date.now();
    try {
      const res = await fetch("/api/v1/health");
      const data = await res.json();
      const latency = Date.now() - start;
      setSysHealth({
        status: data.status || "online",
        dbStatus: data.services?.database?.status || "healthy",
        latency: data.services?.database?.latency_ms || latency,
        bookingsCount: data.services?.database?.total_bookings || 0,
        uptime: data.uptime_seconds || 120,
      });
      addLog("DATABASE", `Supabase response ping OK (${latency}ms)`);
    } catch {
      setSysHealth({
        status: "degraded",
        dbStatus: "error",
        latency: 999,
        bookingsCount: 0,
        uptime: 0,
      });
      addLog("ERROR", "Health check fetch failed");
    }
  };

  // Run API Explorer Request
  const executeApiRequest = async () => {
    setApiLoading(true);
    setApiResponse(null);
    setResponseStatus(null);

    let path = selectedEndpoint.path;
    Object.keys(explorerParams).forEach((key) => {
      if (path.includes(`{${key}}`)) {
        path = path.replace(`{${key}}`, explorerParams[key] || "id");
      }
    });

    const queryPairs: string[] = [];
    selectedEndpoint.params.forEach((p) => {
      if (!selectedEndpoint.path.includes(`{${p.key}}`) && explorerParams[p.key]) {
        queryPairs.push(`${encodeURIComponent(p.key)}=${encodeURIComponent(explorerParams[p.key])}`);
      }
    });
    const fullUrl = path + (queryPairs.length > 0 ? `?${queryPairs.join("&")}` : "");

    addLog("INFO", `API Executed: ${selectedEndpoint.method} ${fullUrl}`);

    const startTime = Date.now();
    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKeys[0]?.key || "arb_live_demo",
        },
      };

      if ((selectedEndpoint.method === "POST" || selectedEndpoint.method === "PATCH") && explorerBody) {
        options.body = explorerBody;
      }

      const res = await fetch(fullUrl, options);
      const elapsed = Date.now() - startTime;
      const data = await res.json();

      setResponseStatus(res.status);
      setResponseLatency(elapsed);
      setApiResponse(data);
      addLog(res.ok ? "INFO" : "WARN", `API Response ${res.status} (${elapsed}ms)`);
    } catch (err: unknown) {
      const elapsed = Date.now() - startTime;
      setResponseStatus(500);
      setResponseLatency(elapsed);
      setApiResponse({ error: err instanceof Error ? err.message : "Request failed" });
      addLog("ERROR", `API Request Error: ${err instanceof Error ? err.message : "Failed"}`);
    } finally {
      setApiLoading(false);
    }
  };

  // Generate Code Snippets
  const generateSnippet = () => {
    let path = selectedEndpoint.path;
    Object.keys(explorerParams).forEach((key) => {
      if (path.includes(`{${key}}`)) {
        path = path.replace(`{${key}}`, explorerParams[key] || "id");
      }
    });
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://arabellaevents.ph";
    const fullUrl = `${baseUrl}${path}`;
    const activeApiKey = apiKeys[0]?.key || "arb_live_your_key_here";

    if (codeLang === "curl") {
      let cmd = `curl -X ${selectedEndpoint.method} "${fullUrl}" \\\n  -H "Authorization: Bearer ${activeApiKey}" \\\n  -H "Content-Type: application/json"`;
      if (explorerBody && selectedEndpoint.method !== "GET") {
        cmd += ` \\\n  -d '${explorerBody.replace(/\n/g, "")}'`;
      }
      return cmd;
    }
    if (codeLang === "fetch") {
      return `fetch("${fullUrl}", {
  method: "${selectedEndpoint.method}",
  headers: {
    "Authorization": "Bearer ${activeApiKey}",
    "Content-Type": "application/json"
  }${explorerBody && selectedEndpoint.method !== "GET" ? `,\n  body: JSON.stringify(${explorerBody})` : ""}
})
.then(res => res.json())
.then(data => console.log(data));`;
    }
    if (codeLang === "supabase") {
      if (selectedEndpoint.id.includes("bookings")) {
        return `import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const { data, error } = await supabase
  .from("bookings")
  .select("*")
  .order("created_at", { ascending: false });`;
      }
      return `import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const { data, error } = await supabase.from("gallery").select("*");`;
    }
    if (codeLang === "python") {
      return `import requests

url = "${fullUrl}"
headers = {
    "Authorization": "Bearer ${activeApiKey}",
    "Content-Type": "application/json"
}

response = requests.${selectedEndpoint.method.toLowerCase()}(url, headers=headers${
        explorerBody && selectedEndpoint.method !== "GET" ? `, json=${explorerBody}` : ""
      })
print(response.json())`;
    }
    if (codeLang === "node") {
      return `const axios = require('axios');

axios.${selectedEndpoint.method.toLowerCase()}("${fullUrl}"${
        explorerBody && selectedEndpoint.method !== "GET" ? `, ${explorerBody}` : ""
      }, {
  headers: {
    'Authorization': 'Bearer ${activeApiKey}',
    'Content-Type': 'application/json'
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));`;
    }
    return "";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Generate API Key
  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;
    const prefix = newKeyEnv === "production" ? "arb_live_" : "arb_test_";
    const randomHash = Array.from({ length: 24 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    const newKeyObj: ApiKey = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      key: `${prefix}${randomHash}`,
      env: newKeyEnv,
      permission: newKeyPerm,
      created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      last_used: "Never",
    };
    const updated = [newKeyObj, ...apiKeys];
    setApiKeys(updated);
    try {
      localStorage.setItem("arb_dev_api_keys", JSON.stringify(updated));
    } catch {
      // ignore
    }
    setNewKeyName("");
    setShowKeyModal(false);
    addLog("INFO", `Created API Key '${newKeyObj.name}' (${newKeyObj.env})`);
  };

  const handleRevokeKey = (id: string) => {
    const updated = apiKeys.filter((k) => k.id !== id);
    setApiKeys(updated);
    try {
      localStorage.setItem("arb_dev_api_keys", JSON.stringify(updated));
    } catch {
      // ignore
    }
    addLog("WARN", `Revoked API Key (ID: ${id})`);
  };

  // Create Webhook
  const handleCreateWebhook = () => {
    if (!newWhUrl.trim()) return;
    const newWh: WebhookSub = {
      id: `wh-${Date.now()}`,
      url: newWhUrl.trim(),
      events: newWhEvents,
      status: "active",
      secret: `whsec_${Math.random().toString(36).substring(2, 18)}`,
      created_at: new Date().toISOString().slice(0, 10),
    };
    const updated = [newWh, ...webhooks];
    setWebhooks(updated);
    try {
      localStorage.setItem("arb_dev_webhooks", JSON.stringify(updated));
    } catch {
      // ignore
    }
    setNewWhUrl("");
    setShowWhModal(false);
    addLog("INFO", `Added Webhook endpoint: ${newWh.url}`);
  };

  // Test Webhook Dispatch
  const testWebhookDispatch = async (wh: WebhookSub) => {
    setWhTesting(true);
    addLog("INFO", `Dispatching test webhook payload to ${wh.url}`);
    try {
      const res = await fetch("/api/v1/webhooks/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_url: wh.url,
          event: wh.events[0] || "booking.created",
          payload: {
            test: true,
            message: "Simulated Arabella Event Dispatch",
            triggered_at: new Date().toISOString(),
          },
        }),
      });
      const data = await res.json();
      const newLog: WebhookLog = {
        id: `whlog-${Date.now()}`,
        event: wh.events[0] || "booking.created",
        url: wh.url,
        status: data.response?.status || 200,
        statusText: data.response?.status_text || "OK",
        latencyMs: data.response?.latency_ms || 45,
        timestamp: new Date().toLocaleTimeString(),
        payload: data.sent_payload || {},
      };
      setWebhookLogs((prev) => [newLog, ...prev]);
      addLog("INFO", `Webhook delivered to ${wh.url} (Status: ${newLog.status})`);
    } catch {
      addLog("ERROR", `Webhook delivery failed for ${wh.url}`);
    } finally {
      setWhTesting(false);
    }
  };

  // Fetch DB table content
  const fetchDbTable = async () => {
    setDbLoading(true);
    setDbError(null);
    addLog("DATABASE", `Querying Supabase table '${selectedDbTable}'...`);
    try {
      const { data, error } = await supabase
        .from(selectedDbTable)
        .select("*")
        .limit(20);

      if (error) {
        setDbError(error.message);
        addLog("ERROR", `DB Error: ${error.message}`);
      } else {
        setDbRows(data || []);
        addLog("DATABASE", `Fetched ${data ? data.length : 0} rows from '${selectedDbTable}'`);
      }
    } catch (err: unknown) {
      setDbError(err instanceof Error ? err.message : "Database fetch failed");
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "database") {
      fetchDbTable();
    }
  }, [activeTab, selectedDbTable]);

  const filteredLogs = logs.filter((l) => (logFilter === "ALL" ? true : l.level === logFilter));

  return (
    <DevGuard>
    <div className="min-h-screen bg-[#0d1117] text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Top Bar Header */}
      <header className="border-b border-slate-800 bg-[#161b22]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin"
              className="flex items-center space-x-2 text-xs uppercase tracking-widest text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Admin</span>
            </Link>
            <span className="text-slate-700">|</span>
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>ARABELLA</span>
                <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-mono">
                  DEV PORTAL v1.0
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3 text-xs font-mono bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">DB Latency:</span>
              <span className="text-emerald-400 font-semibold">{sysHealth.latency}ms</span>
              <span className="text-slate-700">•</span>
              <span className="text-slate-400">Supabase:</span>
              <span className="text-cyan-400 capitalize">{sysHealth.dbStatus}</span>
            </div>

            <button
              onClick={fetchHealth}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md font-medium border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh Ping</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-1 sm:space-x-4 mb-8 overflow-x-auto scrollbar-none">
          {[
            { id: "overview", label: "Overview & Health", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
            { id: "billing", label: "Billing & Kill-Switch", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
            { id: "api", label: "API Explorer & Docs", icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
            { id: "keys", label: "API Keys", icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" },
            { id: "webhooks", label: "Webhooks", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
            { id: "database", label: "Database Inspector", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
            { id: "logs", label: "System Logs", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-cyan-400 text-cyan-400 bg-cyan-950/20"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* System Status Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#161b22] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider">System Status</span>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xl font-bold text-white uppercase">{sysHealth.status}</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-2 font-mono">All services operational</span>
              </div>

              <div className="bg-[#161b22] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Supabase Connection</span>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-2xl font-bold text-cyan-400 font-mono">{sysHealth.latency}ms</span>
                  <span className="text-xs text-slate-400">ping</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-2 font-mono">tgogbceokcmmhhtwgehd.supabase.co</span>
              </div>

              <div className="bg-[#161b22] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Total Bookings DB</span>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-2xl font-bold text-emerald-400 font-mono">{sysHealth.bookingsCount}</span>
                  <span className="text-xs text-slate-400">records</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-2 font-mono">`bookings` table</span>
              </div>

              <div className="bg-[#161b22] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Active API Keys</span>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-2xl font-bold text-amber-400 font-mono">{apiKeys.length}</span>
                  <span className="text-xs text-slate-400">keys</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-2 font-mono">{webhooks.length} Webhook endpoint</span>
              </div>
            </div>

            {/* Quickstart Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* REST API & Quick Call */}
              <div className="bg-[#161b22] border border-slate-800 rounded-xl p-6">
                <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                  <span className="text-cyan-400">⚡</span> Quickstart REST API
                </h2>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Arabella Events provides standard REST API endpoints for external integrations, mobile apps, and custom workflow automations.
                </p>
                <div className="bg-[#0d1117] border border-slate-800 p-4 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto space-y-2">
                  <div className="text-slate-500"># Fetch system health check</div>
                  <div className="text-cyan-400">curl -X GET &quot;/api/v1/health&quot;</div>
                  <div className="text-slate-500"># Fetch all event bookings</div>
                  <div className="text-cyan-400">curl -X GET &quot;/api/v1/bookings?limit=10&quot; -H &quot;x-api-key: {apiKeys[0]?.key || "arb_live_..."}&quot;</div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => {
                      setActiveTab("api");
                      setSelectedEndpoint(ENDPOINTS[1]);
                    }}
                    className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Open API Explorer →
                  </button>
                  <button
                    onClick={() => setActiveTab("keys")}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-4 py-2 rounded-lg border border-slate-700 transition-colors"
                  >
                    Manage Keys
                  </button>
                </div>
              </div>

              {/* Environment Checklist */}
              <div className="bg-[#161b22] border border-slate-800 rounded-xl p-6">
                <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                  <span className="text-emerald-400">🛡️</span> Environment & Security Audit
                </h2>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-[#0d1117] border border-slate-800 rounded-lg">
                    <span className="text-slate-300">NEXT_PUBLIC_SUPABASE_URL</span>
                    <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                      Configured
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#0d1117] border border-slate-800 rounded-lg">
                    <span className="text-slate-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                    <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                      Configured
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#0d1117] border border-slate-800 rounded-lg">
                    <span className="text-slate-300">Row Level Security (RLS)</span>
                    <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded">
                      Enabled
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#0d1117] border border-slate-800 rounded-lg">
                    <span className="text-slate-300">Next.js Webpack Engine</span>
                    <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded">
                      v16.3 (Active)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Overview */}
            <div className="bg-[#161b22] border border-slate-800 rounded-xl p-6">
              <h2 className="text-base font-bold text-white mb-4">System Architecture Diagram</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-[#0d1117] border border-slate-800 rounded-xl">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold">
                    1
                  </div>
                  <h3 className="text-sm font-semibold text-white">Client / Public Web</h3>
                  <p className="text-xs text-slate-400 mt-1">Bookings inquiry modal, gallery view, and public menu</p>
                </div>
                <div className="p-4 bg-[#0d1117] border border-slate-800 rounded-xl">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold">
                    2
                  </div>
                  <h3 className="text-sm font-semibold text-white">Next.js API & Admin</h3>
                  <p className="text-xs text-slate-400 mt-1">REST Controllers, auth middleware, and webhook delivery engine</p>
                </div>
                <div className="p-4 bg-[#0d1117] border border-slate-800 rounded-xl">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold">
                    3
                  </div>
                  <h3 className="text-sm font-semibold text-white">Supabase PostgreSQL</h3>
                  <p className="text-xs text-slate-400 mt-1">Managed database with RLS policies, real-time sync, and storage</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: BILLING & SITE KILL-SWITCH */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            {/* Header Status Card */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#161b22] border border-slate-800 p-6 rounded-xl">
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-base font-bold text-white">Monthly Subscription & Site Kill-Switch Controls</h2>
                  {siteControlSaved && (
                    <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded font-mono font-semibold animate-bounce">
                      ✓ Changes Saved & Applied!
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Manage website status, monthly payment due dates, and control access permissions when payments are overdue.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5"
                >
                  <span>Preview Public Site</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Master Control Switch Cards */}
            <div className="bg-[#161b22] border border-slate-800 p-6 rounded-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Master Website Access State
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Active */}
                <button
                  type="button"
                  onClick={() => saveSiteControl({ ...siteControl, status: "active" })}
                  className={`p-5 rounded-xl border text-left transition-all ${
                    siteControl.status === "active"
                      ? "bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/40"
                      : "bg-[#0d1117] border-slate-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold uppercase bg-emerald-900/60 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded">
                      Default
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">🟢 Active / Operational</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Website is live and fully accessible to all visitors and customers.
                  </p>
                </button>

                {/* Overdue Locked */}
                <button
                  type="button"
                  onClick={() =>
                    saveSiteControl({
                      ...siteControl,
                      status: "overdue_locked",
                      paymentStatus: "overdue",
                    })
                  }
                  className={`p-5 rounded-xl border text-left transition-all ${
                    siteControl.status === "overdue_locked"
                      ? "bg-red-950/50 border-red-500 shadow-lg shadow-red-950/50"
                      : "bg-[#0d1117] border-slate-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[10px] font-mono font-bold uppercase bg-red-900/60 text-red-300 border border-red-700 px-2 py-0.5 rounded">
                      KILL-SWITCH
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">🔴 Disable Site (Overdue)</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Turns OFF public website access and displays the Overdue Payment notice to all visitors.
                  </p>
                </button>

                {/* Maintenance */}
                <button
                  type="button"
                  onClick={() => saveSiteControl({ ...siteControl, status: "maintenance" })}
                  className={`p-5 rounded-xl border text-left transition-all ${
                    siteControl.status === "maintenance"
                      ? "bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/40"
                      : "bg-[#0d1117] border-slate-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="text-[10px] font-mono font-bold uppercase bg-amber-900/60 text-amber-300 border border-amber-700 px-2 py-0.5 rounded">
                      Maintenance
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">🟡 Maintenance Mode</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Temporarily shows a scheduled maintenance screen for updates.
                  </p>
                </button>
              </div>
            </div>

            {/* Admin Payment Submissions Verification Panel */}
            <div className="bg-[#161b22] border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Admin GCash / Bank Payment Proofs</span>
                    <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-mono">
                      {paymentSubmissions.filter((s) => s.status === "pending").length} Pending
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Review and verify GCash or Bank Transfer receipts submitted by admins to unlock site access and advance due dates.
                  </p>
                </div>
              </div>

              {paymentSubmissions.length === 0 ? (
                <div className="p-6 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
                  No payment proof submissions recorded yet. Admins can submit receipts from the Admin Dashboard.
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  {paymentSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className={`bg-[#0d1117] border p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 transition-all ${
                        sub.status === "pending"
                          ? "border-amber-500/50 bg-amber-950/10"
                          : sub.status === "verified"
                          ? "border-emerald-800/40 opacity-80"
                          : "border-rose-800/40 opacity-50"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                              sub.method === "gcash"
                                ? "bg-blue-950 text-blue-400 border-blue-800"
                                : "bg-purple-950 text-purple-400 border-purple-800"
                            }`}
                          >
                            {sub.method === "gcash" ? "💙 GCash" : "🏦 Bank Transfer"}
                          </span>
                          <span className="text-white font-bold">{sub.amount}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                              sub.status === "pending"
                                ? "bg-amber-950 text-amber-400 border-amber-800"
                                : sub.status === "verified"
                                ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                                : "bg-rose-950 text-rose-400 border-rose-800"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>
                        <div className="text-slate-300 font-semibold">Ref #: {sub.refNumber}</div>
                        <div className="text-slate-400 text-[11px]">
                          Payer: {sub.payerName} • Submitted: {sub.submittedAt}
                        </div>
                      </div>

                      {/* Receipt Preview */}
                      {sub.receiptUrl && (
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-700 bg-black">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={sub.receiptUrl} alt="Receipt" className="object-cover w-full h-full" />
                        </div>
                      )}

                      {/* Verification Actions */}
                      {sub.status === "pending" && (
                        <div className="flex space-x-2 font-sans">
                          <button
                            type="button"
                            onClick={() => verifyPayment(sub.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-md shadow-emerald-950/40"
                          >
                            ✓ Verify & Unlock Site
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectPayment(sub.id)}
                            className="bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Monthly Subscription & Automation Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Details Form */}
              <div className="bg-[#161b22] border border-slate-800 p-6 rounded-xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Monthly Subscription Details
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Monthly Subscription Fee</label>
                    <input
                      type="text"
                      value={siteControl.monthlyFee}
                      onChange={(e) =>
                        setSiteControl({ ...siteControl, monthlyFee: e.target.value })
                      }
                      placeholder="₱5,000 / Month"
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Payment Status</label>
                    <select
                      value={siteControl.paymentStatus}
                      onChange={(e) =>
                        setSiteControl({
                          ...siteControl,
                          paymentStatus: e.target.value as typeof siteControl.paymentStatus,
                        })
                      }
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                    >
                      <option value="paid">Paid (Up to date)</option>
                      <option value="pending">Pending Payment</option>
                      <option value="overdue">Overdue (Unpaid)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Next Payment Due Date</label>
                    <input
                      type="date"
                      value={siteControl.dueDate}
                      onChange={(e) =>
                        setSiteControl({ ...siteControl, dueDate: e.target.value })
                      }
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Overdue Grace Period (Days)</label>
                    <input
                      type="number"
                      value={siteControl.gracePeriodDays}
                      onChange={(e) =>
                        setSiteControl({
                          ...siteControl,
                          gracePeriodDays: parseInt(e.target.value || "0", 10),
                        })
                      }
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteControl.autoLockEnabled}
                        onChange={(e) =>
                          setSiteControl({ ...siteControl, autoLockEnabled: e.target.checked })
                        }
                        className="rounded border-slate-700 text-cyan-600 focus:ring-0 w-4 h-4"
                      />
                      <span className="text-slate-200 font-medium">
                        Auto-Lock Website when Payment is Overdue
                      </span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-1 pl-7">
                      If enabled, the site will automatically disable public access when current date &gt; due date + grace period.
                    </p>
                  </div>
                </div>
              </div>

              {/* Notice Customizer & Passcode */}
              <div className="bg-[#161b22] border border-slate-800 p-6 rounded-xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Overdue Notice & Passcode Controls
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Custom Overdue Notice Message</label>
                    <textarea
                      rows={4}
                      value={siteControl.overdueMessage}
                      onChange={(e) =>
                        setSiteControl({ ...siteControl, overdueMessage: e.target.value })
                      }
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Developer Contact Email</label>
                    <input
                      type="email"
                      value={siteControl.contactEmail}
                      onChange={(e) =>
                        setSiteControl({ ...siteControl, contactEmail: e.target.value })
                      }
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-lg p-2.5 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Developer Emergency Bypass PIN</label>
                    <input
                      type="text"
                      value={siteControl.bypassPin}
                      onChange={(e) =>
                        setSiteControl({ ...siteControl, bypassPin: e.target.value })
                      }
                      placeholder="1234"
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-lg p-2.5 text-cyan-300 font-mono tracking-widest focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Secret PIN entered on the lock screen to temporarily bypass the overdue notice.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => saveSiteControl(siteControl)}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs py-3 rounded-lg transition-colors shadow-lg shadow-cyan-900/30"
                  >
                    Save & Apply Billing Control Rules
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: API EXPLORER & DOCS */}
        {activeTab === "api" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar Endpoint List */}
            <div className="lg:col-span-4 bg-[#161b22] border border-slate-800 rounded-xl p-4 space-y-2">
              <h2 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-3 px-2">
                API Endpoints ({ENDPOINTS.length})
              </h2>
              {ENDPOINTS.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex items-center justify-between ${
                    selectedEndpoint.id === ep.id
                      ? "bg-slate-800 border-cyan-500/50 text-white"
                      : "bg-[#0d1117] border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-200">{ep.title}</div>
                    <div className="font-mono text-[11px] text-slate-400 mt-0.5">{ep.path}</div>
                  </div>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      ep.method === "GET"
                        ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                        : ep.method === "POST"
                        ? "bg-blue-950 text-blue-400 border-blue-800"
                        : "bg-amber-950 text-amber-400 border-amber-800"
                    }`}
                  >
                    {ep.method}
                  </span>
                </button>
              ))}
            </div>

            {/* Main Interactive Request & Response Tester */}
            <div className="lg:col-span-8 space-y-6">
              {/* Request Builder Card */}
              <div className="bg-[#161b22] border border-slate-800 rounded-xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-white">{selectedEndpoint.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedEndpoint.description}</p>
                  </div>
                  <button
                    onClick={executeApiRequest}
                    disabled={apiLoading}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-xs px-5 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-cyan-900/20"
                  >
                    {apiLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                        <span>Send Request</span>
                      </>
                    )}
                  </button>
                </div>

                {/* URL Bar Preview */}
                <div className="mt-4 bg-[#0d1117] border border-slate-800 p-3 rounded-lg font-mono text-xs flex items-center space-x-3">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                      selectedEndpoint.method === "GET"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : selectedEndpoint.method === "POST"
                        ? "bg-blue-950 text-blue-400 border border-blue-800"
                        : "bg-amber-950 text-amber-400 border border-amber-800"
                    }`}
                  >
                    {selectedEndpoint.method}
                  </span>
                  <span className="text-slate-300 font-semibold">{selectedEndpoint.path}</span>
                </div>

                {/* Query & URL Parameters Form */}
                {selectedEndpoint.params.length > 0 && (
                  <div className="mt-5 space-y-3">
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Parameters & Headers
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedEndpoint.params.map((param) => (
                        <div key={param.key} className="space-y-1">
                          <label className="text-xs font-mono text-slate-400">{param.key}</label>
                          <input
                            type="text"
                            value={explorerParams[param.key] || ""}
                            placeholder={param.placeholder}
                            onChange={(e) =>
                              setExplorerParams({ ...explorerParams, [param.key]: e.target.value })
                            }
                            className="w-full bg-[#0d1117] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Request Body JSON Editor */}
                {(selectedEndpoint.method === "POST" || selectedEndpoint.method === "PATCH") && (
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        JSON Request Payload
                      </h3>
                      <span className="text-[11px] text-slate-500 font-mono">application/json</span>
                    </div>
                    <textarea
                      rows={6}
                      value={explorerBody}
                      onChange={(e) => setExplorerBody(e.target.value)}
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-lg p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 leading-relaxed"
                    />
                  </div>
                )}
              </div>

              {/* Live Response Inspector */}
              <div className="bg-[#161b22] border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Response Inspector</span>
                    {responseStatus !== null && (
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                          responseStatus >= 200 && responseStatus < 300
                            ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                            : "bg-rose-950 text-rose-400 border-rose-800"
                        }`}
                      >
                        Status: {responseStatus}
                      </span>
                    )}
                  </h3>
                  {responseLatency !== null && (
                    <span className="text-xs font-mono text-slate-400">Time: {responseLatency}ms</span>
                  )}
                </div>

                <div className="mt-4 bg-[#0d1117] border border-slate-800 rounded-lg p-4 font-mono text-xs overflow-x-auto min-h-[160px] max-h-[350px]">
                  {apiResponse ? (
                    <pre className="text-emerald-400 leading-relaxed">
                      {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-slate-600 flex flex-col items-center justify-center h-28 space-y-2">
                      <svg className="w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Click &quot;Send Request&quot; above to inspect response</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Code Snippets Generator */}
              <div className="bg-[#161b22] border border-slate-800 rounded-xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white">Client Integration SDK Code Generator</h3>
                  <div className="flex space-x-1 font-mono text-xs bg-[#0d1117] p-1 rounded-lg border border-slate-800">
                    {(["curl", "fetch", "supabase", "python", "node"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setCodeLang(lang)}
                        className={`px-2.5 py-1 rounded capitalize transition-all ${
                          codeLang === lang
                            ? "bg-cyan-950 text-cyan-400 font-bold border border-cyan-800"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative mt-4">
                  <pre className="bg-[#0d1117] border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                    {generateSnippet()}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(generateSnippet())}
                    className="absolute top-3 right-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded border border-slate-700 transition-colors font-mono flex items-center gap-1.5"
                  >
                    {copiedCode ? (
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: API KEYS */}
        {activeTab === "keys" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#161b22] border border-slate-800 p-6 rounded-xl">
              <div>
                <h2 className="text-base font-bold text-white">API Keys & Authentication Tokens</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage API keys for accessing Arabella Events REST endpoints and webhook payloads.
                </p>
              </div>
              <button
                onClick={() => setShowKeyModal(true)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Generate New Key</span>
              </button>
            </div>

            {/* Keys Table */}
            <div className="bg-[#161b22] border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0d1117] text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-4">Key Name</th>
                      <th className="p-4">Secret Key Token</th>
                      <th className="p-4">Env</th>
                      <th className="p-4">Permission</th>
                      <th className="p-4">Created</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {apiKeys.map((key) => {
                      const isVisible = visibleKeys[key.id];
                      const displayKey = isVisible
                        ? key.key
                        : `${key.key.substring(0, 8)}••••••••••••${key.key.substring(key.key.length - 4)}`;
                      return (
                        <tr key={key.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-4 font-sans font-semibold text-white">{key.name}</td>
                          <td className="p-4 text-cyan-300 font-mono">
                            <div className="flex items-center space-x-2">
                              <span>{displayKey}</span>
                              <button
                                onClick={() =>
                                  setVisibleKeys({ ...visibleKeys, [key.id]: !isVisible })
                                }
                                className="text-slate-500 hover:text-slate-300"
                                title="Toggle visibility"
                              >
                                {isVisible ? "🙈" : "👁️"}
                              </button>
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                                key.env === "production"
                                  ? "bg-rose-950 text-rose-400 border-rose-800"
                                  : "bg-blue-950 text-blue-400 border-blue-800"
                              }`}
                            >
                              {key.env}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300 uppercase text-[10px]">
                              {key.permission}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400">{key.created_at}</td>
                          <td className="p-4 text-right space-x-2 font-sans">
                            <button
                              onClick={() => copyToClipboard(key.key)}
                              className="text-xs text-cyan-400 hover:underline"
                            >
                              Copy
                            </button>
                            <span className="text-slate-700">|</span>
                            <button
                              onClick={() => handleRevokeKey(key.id)}
                              className="text-xs text-rose-400 hover:underline"
                            >
                              Revoke
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WEBHOOKS */}
        {activeTab === "webhooks" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#161b22] border border-slate-800 p-6 rounded-xl">
              <div>
                <h2 className="text-base font-bold text-white">Webhooks & Real-time Event Subscriptions</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Receive HTTP POST notifications whenever event bookings, deposits, or status changes occur.
                </p>
              </div>
              <button
                onClick={() => setShowWhModal(true)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Webhook Endpoint</span>
              </button>
            </div>

            {/* Webhook Endpoints List */}
            <div className="grid grid-cols-1 gap-4">
              {webhooks.map((wh) => (
                <div key={wh.id} className="bg-[#161b22] border border-slate-800 p-5 rounded-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span className="font-mono text-sm font-bold text-cyan-300">{wh.url}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => testWebhookDispatch(wh)}
                        disabled={whTesting}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        ⚡ <span>Test Payload Dispatch</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    <span className="text-slate-400">Subscribed Events:</span>
                    {wh.events.map((ev) => (
                      <span key={ev} className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded text-[11px]">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Webhook Delivery Logs */}
            <div className="bg-[#161b22] border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Webhook Delivery Logs ({webhookLogs.length})</span>
                <span className="text-xs text-slate-400 font-mono">Real-time Dispatcher</span>
              </h3>

              {webhookLogs.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono py-6 text-center">
                  No webhook delivery logs recorded yet. Click &quot;Test Payload Dispatch&quot; above to simulate a dispatch.
                </p>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  {webhookLogs.map((log) => (
                    <div key={log.id} className="bg-[#0d1117] border border-slate-800 p-4 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              log.status === 200
                                ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                                : "bg-rose-950 text-rose-400 border-rose-800"
                            }`}
                          >
                            HTTP {log.status} {log.statusText}
                          </span>
                          <span className="text-slate-300 font-semibold">{log.event}</span>
                        </div>
                        <div className="text-slate-500 text-[11px]">{log.timestamp} • {log.latencyMs}ms</div>
                      </div>
                      <div className="text-slate-400 text-[11px] truncate">Target: {log.url}</div>
                      <pre className="text-[11px] text-cyan-400 bg-slate-900/60 p-2.5 rounded border border-slate-800 overflow-x-auto mt-2">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: DATABASE INSPECTOR */}
        {activeTab === "database" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#161b22] border border-slate-800 p-6 rounded-xl">
              <div>
                <h2 className="text-base font-bold text-white">Supabase PostgreSQL Schema & Table Browser</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Inspect table schemas, query row contents, and view Row Level Security (RLS) policies.
                </p>
              </div>

              <div className="flex space-x-2">
                {(["bookings", "gallery"] as const).map((tbl) => (
                  <button
                    key={tbl}
                    onClick={() => setSelectedDbTable(tbl)}
                    className={`text-xs font-mono font-bold px-4 py-2 rounded-lg border transition-all ${
                      selectedDbTable === tbl
                        ? "bg-cyan-950 text-cyan-400 border-cyan-800"
                        : "bg-[#0d1117] text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    public.{tbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Schema Columns & RLS Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#161b22] border border-slate-800 p-5 rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Table Schema Definition: `{selectedDbTable}`
                </h3>
                <div className="space-y-2 text-xs font-mono">
                  {selectedDbTable === "bookings" ? (
                    <>
                      <div className="p-2 bg-[#0d1117] border border-slate-800 rounded flex justify-between">
                        <span className="text-cyan-300">id</span>
                        <span className="text-slate-400">UUID PRIMARY KEY (gen_random_uuid())</span>
                      </div>
                      <div className="p-2 bg-[#0d1117] border border-slate-800 rounded flex justify-between">
                        <span className="text-cyan-300">name, email, phone</span>
                        <span className="text-slate-400">TEXT NOT NULL</span>
                      </div>
                      <div className="p-2 bg-[#0d1117] border border-slate-800 rounded flex justify-between">
                        <span className="text-cyan-300">event_type, status</span>
                        <span className="text-slate-400">TEXT DEFAULT &apos;new&apos;</span>
                      </div>
                      <div className="p-2 bg-[#0d1117] border border-slate-800 rounded flex justify-between">
                        <span className="text-cyan-300">deposit_amount, total_amount</span>
                        <span className="text-slate-400">DECIMAL(10,2) DEFAULT 0</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-[#0d1117] border border-slate-800 rounded flex justify-between">
                        <span className="text-cyan-300">id</span>
                        <span className="text-slate-400">UUID PRIMARY KEY</span>
                      </div>
                      <div className="p-2 bg-[#0d1117] border border-slate-800 rounded flex justify-between">
                        <span className="text-cyan-300">src, alt, category</span>
                        <span className="text-slate-400">TEXT NOT NULL</span>
                      </div>
                      <div className="p-2 bg-[#0d1117] border border-slate-800 rounded flex justify-between">
                        <span className="text-cyan-300">sort_order</span>
                        <span className="text-slate-400">INTEGER DEFAULT 0</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* RLS Policies Card */}
              <div className="bg-[#161b22] border border-slate-800 p-5 rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Row Level Security (RLS) Policies
                </h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2 bg-[#0d1117] border border-slate-800 rounded flex justify-between items-center">
                    <span className="text-emerald-400">Allow anonymous inserts</span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">INSERT</span>
                  </div>
                  <div className="p-2 bg-[#0d1117] border border-slate-800 rounded flex justify-between items-center">
                    <span className="text-cyan-400">Allow authenticated reads</span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">SELECT</span>
                  </div>
                  <div className="p-2 bg-[#0d1117] border border-slate-800 rounded flex justify-between items-center">
                    <span className="text-cyan-400">Allow authenticated updates</span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">UPDATE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SQL Query Console */}
            <div className="bg-[#161b22] border border-slate-800 p-6 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>SQL Query Tester Playground</span>
                <span className="text-xs text-slate-400 font-mono">PostgreSQL Client</span>
              </h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customSqlQuery}
                  onChange={(e) => setCustomSqlQuery(e.target.value)}
                  className="flex-1 bg-[#0d1117] border border-slate-800 rounded-lg px-4 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={fetchDbTable}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors"
                >
                  Execute Query
                </button>
              </div>
            </div>

            {/* Live Data Browser */}
            <div className="bg-[#161b22] border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-xs font-bold text-white font-mono uppercase">
                  Data Rows ({dbRows.length})
                </h3>
                {dbLoading && <span className="text-xs text-cyan-400 font-mono">Querying database...</span>}
              </div>

              {dbError ? (
                <div className="p-6 text-center text-rose-400 text-xs font-mono">
                  Error loading table data: {dbError}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#0d1117] text-slate-400 uppercase text-[11px] border-b border-slate-800">
                      <tr>
                        {dbRows.length > 0
                          ? Object.keys(dbRows[0]).slice(0, 6).map((k) => (
                              <th key={k} className="p-3.5">
                                {k}
                              </th>
                            ))
                          : <th className="p-4">No records found</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {dbRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          {Object.values(row).slice(0, 6).map((val, valIdx) => (
                            <td key={valIdx} className="p-3.5 truncate max-w-[200px]">
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: SYSTEM LOGS */}
        {activeTab === "logs" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#161b22] border border-slate-800 p-6 rounded-xl">
              <div>
                <h2 className="text-base font-bold text-white">System Logs & Runtime Console</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Live diagnostics, database queries, API dispatches, and runtime errors.
                </p>
              </div>

              <div className="flex space-x-2">
                {(["ALL", "INFO", "WARN", "ERROR", "DATABASE"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setLogFilter(filter)}
                    className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border transition-all ${
                      logFilter === filter
                        ? "bg-cyan-950 text-cyan-400 border-cyan-800"
                        : "bg-[#0d1117] text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Log Stream Console */}
            <div className="bg-[#0d1117] border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-2 min-h-[400px] max-h-[600px] overflow-y-auto">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-3 py-1 border-b border-slate-800/40">
                  <span className="text-slate-500 text-[11px]">{log.timestamp}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.level === "INFO"
                        ? "bg-blue-950 text-blue-400"
                        : log.level === "WARN"
                        ? "bg-amber-950 text-amber-400"
                        : log.level === "ERROR"
                        ? "bg-rose-950 text-rose-400"
                        : "bg-emerald-950 text-emerald-400"
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-slate-200">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5">
            <h3 className="text-lg font-bold text-white">Generate New API Key</h3>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-400 mb-1">Key Name / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Mobile App Backend Service"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full bg-[#0d1117] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Environment</label>
                <select
                  value={newKeyEnv}
                  onChange={(e) => setNewKeyEnv(e.target.value as typeof newKeyEnv)}
                  className="w-full bg-[#0d1117] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="production">Production (arb_live_)</option>
                  <option value="test">Test Sandbox (arb_test_)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Permission Scope</label>
                <select
                  value={newKeyPerm}
                  onChange={(e) => setNewKeyPerm(e.target.value as typeof newKeyPerm)}
                  className="w-full bg-[#0d1117] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="admin">Full Admin Access</option>
                  <option value="write">Write & Read Access</option>
                  <option value="read">Read Only Access</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKey}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs px-5 py-2 rounded-lg"
              >
                Generate Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Modal */}
      {showWhModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5">
            <h3 className="text-lg font-bold text-white">Add Webhook Subscription</h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Payload Target URL</label>
                <input
                  type="url"
                  placeholder="https://api.yourdomain.com/webhooks"
                  value={newWhUrl}
                  onChange={(e) => setNewWhUrl(e.target.value)}
                  className="w-full bg-[#0d1117] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-2">Subscribe to Events</label>
                <div className="space-y-2">
                  {["booking.created", "booking.updated", "deposit.paid", "gallery.updated"].map((ev) => (
                    <label key={ev} className="flex items-center space-x-2 font-mono text-slate-300">
                      <input
                        type="checkbox"
                        checked={newWhEvents.includes(ev)}
                        onChange={(e) => {
                          if (e.target.checked) setNewWhEvents([...newWhEvents, ev]);
                          else setNewWhEvents(newWhEvents.filter((x) => x !== ev));
                        }}
                        className="rounded border-slate-700 text-cyan-600 focus:ring-0"
                      />
                      <span>{ev}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowWhModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWebhook}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs px-5 py-2 rounded-lg"
              >
                Subscribe Endpoint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </DevGuard>
  );
}
