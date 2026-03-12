import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import PageMeta from "../../components/common/PageMeta.tsx";
import { BoxIconLine, GroupIcon } from "../../icons/index.ts";
import { api } from "../../lib/axios.ts";

// Sleek, reusable loading spinner for buttons
const Spinner = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function ControlPanelPage() {
  const [instanceData, setInstanceData] = useState<{
    url: string | null;
    password: string | null;
    status: string | null;
  }>({ url: null, password: null, status: null });

  const [loadingLink, setLoadingLink] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Action States
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function fetchInstanceLink() {
    setLoadingLink(true);
    try {
      const res = await api.get("/instance/link");

      const data = res?.data?.statusCode;

      if (data?.hasInstance) {
        setInstanceData({
          url: data.url,
          password: data.workspace_password,
          status: data.status
        });
      } else {
        setInstanceData({ url: null, password: null, status: null });
      }
    } catch {
      setInstanceData({ url: null, password: null, status: null });
    } finally {
      setLoadingLink(false);
    }
  }

  useEffect(() => {
    fetchInstanceLink();
  }, []);

  async function handleAction(actionFn: () => Promise<void>, setter: (v: boolean) => void) {
    setter(true);
    try {
      await actionFn();
      await fetchInstanceLink();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Action failed");
    } finally {
      setter(false);
    }
  }

  return (
    <div className="min-h-screen pb-20">
      <PageMeta title="Instance Control | Kodebox" description="Manage your cloud instances" />
      <PageBreadcrumb pageTitle="Infrastructure" />

      <div className="min-h-screen rounded-2xl border border-gray-300 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">

        {/* 1. Header Status Section */}
        <div className="mb-8 flex flex-col gap-4 border-b-2 border-gray-200 pb-8 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Workspace Command Center</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage high-performance nodes and secure access credentials.
            </p>
          </div>

          <div className={`flex items-center gap-2 self-start rounded-full border-2 px-3 py-1 text-xs font-bold sm:self-center transition-colors duration-300 ${instanceData.url ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500' : 'border-rose-500/20 bg-rose-500/10 text-rose-500'
            }`}>
            <span className={`h-2 w-2 rounded-full ${instanceData.url ? 'animate-pulse bg-emerald-500' : 'bg-rose-500'}`}></span>
            {instanceData.status?.toUpperCase() || 'OFFLINE'}
          </div>
        </div>

        <div className="mx-auto max-w-5xl">
          {/* 2. Primary Actions Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <button
              onClick={() => handleAction(() => api.post("/instance/"), setCreating)}
              disabled={creating}
              className="group relative flex flex-col items-start rounded-2xl border-2 border-gray-300 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500 hover:shadow-[0_12px_24px_-8px_rgba(16,185,129,0.2)] dark:border-gray-800 dark:bg-white/[0.02] dark:hover:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:hover:border-gray-300 dark:disabled:hover:border-gray-800"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors duration-300 group-hover:bg-emerald-500 group-hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400">
                {creating ? <Spinner className="size-6" /> : <BoxIconLine className="size-7 transition-transform group-hover:scale-110" />}
              </div>
              <h4 className="mt-6 font-bold text-gray-900 dark:text-white">Deploy Instance</h4>
              <p className="mt-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Provision a new high-performance cloud node.</p>
            </button>

            <button
              onClick={() => confirm("Wipe all files?") && handleAction(() => api.post("/instance/reset-workspace"), setResetting)}
              disabled={resetting}
              className="group flex flex-col items-start rounded-2xl border-2 border-gray-300 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-[0_12px_24px_-8px_rgba(59,130,246,0.2)] dark:border-gray-800 dark:bg-white/[0.02] dark:hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:hover:border-gray-300 dark:disabled:hover:border-gray-800"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/10 dark:text-blue-400">
                {resetting ? <Spinner className="size-6" /> : <GroupIcon className="size-7 transition-transform group-hover:scale-110" />}
              </div>
              <h4 className="mt-6 font-bold text-gray-900 dark:text-white">Wipe Workspace</h4>
              <p className="mt-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Restore environment to factory default.</p>
            </button>

            <button
              onClick={() => confirm("Destroy instance?") && handleAction(() => api.delete("/instance/"), setDeleting)}
              disabled={deleting}
              className="group flex flex-col items-start rounded-2xl border-2 border-gray-300 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-rose-500 hover:shadow-[0_12px_24px_-8px_rgba(244,63,94,0.2)] dark:border-gray-800 dark:bg-white/[0.02] dark:hover:border-rose-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:hover:border-gray-300 dark:disabled:hover:border-gray-800"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 transition-colors duration-300 group-hover:bg-rose-500 group-hover:text-white dark:bg-rose-500/10 dark:text-rose-400">
                {deleting ? <Spinner className="size-6" /> : <BoxIconLine className="size-7 transition-transform group-hover:scale-110" />}
              </div>
              <h4 className="mt-6 font-bold text-gray-900 dark:text-white">Delete Instance</h4>
              <p className="mt-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Deallocate all cloud resources permanently.</p>
            </button>
          </div>

          {/* 3. Connection & Security Section */}
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-5">

            {/* Security & Access Info */}
            <div className="rounded-2xl border-2 border-gray-300 bg-gray-50/30 p-6 dark:border-gray-800 dark:bg-white/[0.01] lg:col-span-3">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full transition-colors duration-300 ${instanceData.url ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Access Credentials</span>
                </div>
                <span className="text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400">AES_256_PROTECTED</span>
              </div>

              <div className="flex flex-col gap-5">
                {/* URL Section */}
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-tight text-gray-400">Endpoint URL</label>
                  <div className="flex items-center justify-between overflow-hidden rounded-xl border-2 border-gray-300 bg-white px-5 py-3 transition-colors hover:border-gray-400 dark:border-gray-700 dark:bg-black/30 dark:hover:border-gray-600">
                    <p className="truncate font-mono text-sm font-bold text-gray-800 dark:text-emerald-400/90">
                      {loadingLink ? "RESOLVING..." : instanceData.url ?? "UNASSIGNED"}
                    </p>
                    <button
                      onClick={() => instanceData.url && navigator.clipboard.writeText(instanceData.url)}
                      disabled={!instanceData.url}
                      className="ml-4 rounded-lg bg-gray-900 px-4 py-1.5 text-[10px] font-black uppercase text-white transition-all duration-300 hover:bg-emerald-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Password Section */}
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-tight text-gray-400">Workspace Password</label>
                  <div className="flex items-center justify-between overflow-hidden rounded-xl border-2 border-gray-300 bg-white px-5 py-3 transition-colors hover:border-gray-400 dark:border-gray-700 dark:bg-black/30 dark:hover:border-gray-600">
                    <p className="truncate font-mono text-sm font-bold tracking-widest text-gray-800 dark:text-emerald-400/90">
                      {instanceData.password ? (showPassword ? instanceData.password : "••••••••••••") : "********"}
                    </p>
                    <div className="ml-4 flex gap-2">
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={!instanceData.password}
                        className="rounded-lg bg-gray-100 px-3 py-1.5 text-[10px] font-black uppercase text-gray-600 transition-colors duration-300 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => instanceData.password && navigator.clipboard.writeText(instanceData.password)}
                        disabled={!instanceData.password}
                        className="rounded-lg bg-gray-900 px-4 py-1.5 text-[10px] font-black uppercase text-white transition-all duration-300 hover:bg-emerald-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                <a
                  href={instanceData.url || "#"}
                  target="_blank"
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-black transition-all duration-300 ${instanceData.url
                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/30 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-emerald-500/30'
                    : 'cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-800/50 dark:text-gray-600'
                    }`}
                  onClick={(e) => !instanceData.url && e.preventDefault()}
                >
                  ACCESS WORKSPACE
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Power Operations */}
            <div className="flex flex-col rounded-2xl border-2 border-gray-300 bg-gray-50/30 p-6 dark:border-gray-800 dark:bg-white/[0.01] lg:col-span-2">
              <span className="mb-6 block text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Power Operations</span>
              <div className="flex flex-1 flex-col justify-center gap-4">
                
                {/* Beautiful Boot Button */}
                <button
                  onClick={() => handleAction(() => api.post("/instance/start"), setStarting)}
                  disabled={starting || !!instanceData.url}
                  className={`group flex h-14 w-full items-center justify-between rounded-xl border-2 px-6 font-bold transition-all duration-300 ${
                    instanceData.url
                      ? 'cursor-not-allowed border-gray-300 bg-gray-50 text-gray-400 dark:border-gray-800 dark:bg-white/5 dark:text-gray-600'
                      : 'border-emerald-500 bg-emerald-500 text-white shadow-sm hover:-translate-y-0.5 hover:border-emerald-600 hover:bg-emerald-600 hover:shadow-[0_8px_16px_-6px_rgba(16,185,129,0.4)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {starting && <Spinner className="h-5 w-5 text-white" />}
                    <span className="text-xs uppercase tracking-widest">Boot System</span>
                  </div>
                  <div className={`rounded px-2 py-1 text-[10px] font-mono transition-colors duration-300 ${
                    instanceData.url 
                      ? 'bg-gray-200 dark:bg-white/10' 
                      : 'bg-black/20 text-white group-hover:bg-black/30'
                  }`}>BOOT</div>
                </button>

                {/* Smooth Professional Shutdown Button */}
                <button
                  onClick={() => handleAction(() => api.post("/instance/stop"), setStopping)}
                  disabled={stopping || !instanceData.url}
                  className={`group flex h-14 w-full items-center justify-between rounded-xl border-2 px-6 font-bold transition-all duration-300 ${
                    !instanceData.url
                      ? 'cursor-not-allowed border-gray-300 bg-gray-50 text-gray-400 dark:border-gray-800 dark:bg-white/5 dark:text-gray-600'
                      : 'border-rose-500 bg-white text-rose-600 shadow-sm hover:-translate-y-0.5 hover:border-rose-600 hover:bg-rose-500 hover:text-white hover:shadow-[0_8px_16px_-6px_rgba(244,63,94,0.4)] dark:bg-transparent dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {stopping && <Spinner className="h-5 w-5" />}
                    <span className="text-xs uppercase tracking-widest">Shutdown</span>
                  </div>
                  <div className={`rounded px-2 py-1 text-[10px] font-mono transition-colors duration-300 ${
                    !instanceData.url 
                      ? 'bg-gray-200 dark:bg-white/10' 
                      : 'bg-rose-100 text-rose-600 group-hover:bg-black/20 group-hover:text-white dark:bg-rose-500/20 dark:text-rose-400'
                  }`}>HALT</div>
                </button>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}