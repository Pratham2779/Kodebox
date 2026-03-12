import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/axios";


type Backup = {
  id: number;
  volume_id: number;
  object_path: string;
  size_mb: number;
  created_at: string;
};


const IconPlus = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
);
const IconRestore = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
);
const IconTrash = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
const IconDatabase = () => (
  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
);

export default function BackupsAndRestore() {
  const { loading: authLoading } = useAuth();


  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [rowLoading, setRowLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);


  const fetchBackups = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await api.get("/backups/instance/backups");
      setBackups(res.data?.data || []);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err?.response?.data?.message || "Failed to fetch backups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchBackups();
  }, [authLoading]);

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      setError(null);
      setSuccess(null);
      await api.post("/backups/instance/backups");
      setSuccess("Backup created successfully.");
      await fetchBackups();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Backup creation failed.");
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (backupId: number) => {
    if (!window.confirm("WARNING: Restore this backup? This will overwrite your current workspace files.")) return;
    try {
      setRowLoading(backupId);
      setError(null);
      setSuccess(null);
      await api.post(`/backups/instance/backups/${backupId}/restore`);
      setSuccess("Restore completed successfully. Workspace updated.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Restore failed.");
    } finally {
      setRowLoading(null);
    }
  };

  const handleDelete = async (backupId: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this backup?")) return;
    try {
      setRowLoading(backupId);
      setError(null);
      setSuccess(null);
      await api.delete(`/backups/backups/${backupId}`);
      setBackups((prev) => prev.filter((b) => b.id !== backupId));
      setSuccess("Backup deleted successfully.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Delete failed.");
    } finally {
      setRowLoading(null);
    }
  };


  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <PageMeta
        title="Workspace Backups | Kodebox"
        description="Manage your instance backups securely."
      />
      <PageBreadcrumb pageTitle="Backups & Restore" />

      {/* Main Container - Matches TerminalPage styles */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">

        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Workspace Snapshots
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create, restore, or remove snapshots of your workspace volume.
            </p>
          </div>

          <button
            onClick={handleCreateBackup}
            disabled={creating || loading}
            className={`inline-flex items-center justify-center rounded-lg bg-blue-600 px-7 py-3 text-base font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
          >
            {creating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Creating...
              </>
            ) : (
              <>
                <IconPlus /> Create Backup
              </>
            )}
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-base text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 shadow-sm">
            <strong className="font-semibold">Error:</strong> {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-base text-green-600 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400 shadow-sm">
            <strong className="font-semibold">Success:</strong> {success}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500 dark:text-gray-400">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500 mb-5"></div>
            <p className="text-lg font-medium">Loading backup history...</p>
          </div>
        ) : backups.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-20 dark:border-gray-700 dark:bg-white/[0.02]">
            <div className="mb-5 rounded-full bg-gray-100 p-5 dark:bg-gray-800">
              <IconDatabase />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">No backups found</h4>
            <p className="mt-2 text-base text-gray-500 dark:text-gray-400 max-w-sm text-center">
              You haven't created any backups yet. Create one to ensure your workspace data is safe.
            </p>
          </div>
        ) : (
          // Data Table
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase font-bold tracking-wider text-gray-500 dark:bg-white/[0.05] dark:text-gray-300">
                <tr>
                  <th className="px-6 py-5">Snapshot ID</th>
                  <th className="px-6 py-5">Created Date</th>
                  <th className="px-6 py-5">Size</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {backups.map((backup) => (
                  <tr
                    key={backup.id}
                    className="group bg-white hover:bg-gray-50 dark:bg-transparent dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-5 font-medium text-gray-900 dark:text-white text-base">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </div>
                        #{backup.id}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-base">
                      {new Date(backup.created_at).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        {backup.size_mb > 0 ? `${backup.size_mb} MB` : '< 1 MB'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {/* Restore Button */}
                        <button
                          onClick={() => handleRestore(backup.id)}
                          disabled={rowLoading === backup.id}
                          className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/[0.05] dark:hover:text-blue-400 disabled:opacity-50 transition-all shadow-sm"
                        >
                          {rowLoading === backup.id ? (
                            <span className="animate-pulse">Processing...</span>
                          ) : (
                            <>
                              <IconRestore /> Restore
                            </>
                          )}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(backup.id)}
                          disabled={rowLoading === backup.id}
                          className="inline-flex items-center rounded-lg border border-transparent bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 focus:z-10 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 disabled:opacity-50 transition-colors"
                        >
                          {rowLoading === backup.id ? (
                            <span className="animate-pulse">...</span>
                          ) : (
                            <>
                              <IconTrash /> Delete
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}