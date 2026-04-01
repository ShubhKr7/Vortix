"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import useWorkspaceStore from "@/store/workspaceStore";
import { Plus, Link as LinkIcon, Building2, LogOut, Loader2, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { workspaces, fetchWorkspaces, createWorkspace, joinWorkspace } = useWorkspaceStore();
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      fetchWorkspaces()
        .catch((err) => {
          if (err.response?.status === 401) {
            logout();
            router.push("/login");
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, fetchWorkspaces, router, logout]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName || isCreating) return;
    
    setIsCreating(true);
    try {
      const workspace = await createWorkspace(newWorkspaceName);
      if (workspace && workspace._id) {
        router.push(`/office/${workspace._id}`);
      }
      setNewWorkspaceName("");
    } catch (error) {
      console.error("Failed to create workspace:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!inviteCode) return;
    await joinWorkspace(inviteCode);
    setInviteCode("");
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-950">
      <Loader2 className="animate-spin text-blue-500" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Building2 className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Virtual Office</h1>
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-sm font-medium text-slate-400">Welcome, <span className="text-slate-100">{user?.name}</span></span>
            <button onClick={() => { logout(); router.push("/login"); }} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Actions */}
          <div className="space-y-8">
            <div className="glass p-8 rounded-2xl glow">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Plus className="mr-2 text-blue-500" size={24} /> Create Office
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <input
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
                  placeholder="Workspace Name"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                />
                <button 
                  disabled={isCreating}
                  className={`w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center space-x-2 ${isCreating ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isCreating ? <Loader2 className="animate-spin" size={18} /> : null}
                  <span>{isCreating ? "CREATING..." : "Start New Office"}</span>
                </button>
              </form>
            </div>

            <div className="glass p-8 rounded-2xl border-slate-800">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <LinkIcon className="mr-2 text-purple-500" size={24} /> Join Office
              </h2>
              <form onSubmit={handleJoin} className="space-y-4">
                <input
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono uppercase tracking-widest placeholder:tracking-normal"
                  placeholder="Invite Code (e.g. XJ29P1)"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
                <button className="w-full py-3 bg-slate-100 hover:bg-white text-slate-950 font-semibold rounded-xl transition-all shadow-lg active:scale-[0.98]">
                  Join Existing
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Your Workspaces</h2>
            <div className="grid gap-4">
              {workspaces.length === 0 ? (
                <div className="text-center py-20 glass rounded-2xl border-dashed border-2 border-slate-800">
                  <Building2 size={48} className="mx-auto text-slate-700 mb-4" />
                  <p className="text-slate-500">You haven't joined any offices yet.</p>
                </div>
              ) : (
                workspaces.map((ws) => (
                  <div key={ws._id} className="group glass p-6 rounded-2xl flex items-center justify-between hover:bg-slate-800/50 transition-all cursor-pointer border-slate-800/50" onClick={() => router.push(`/office/${ws._id}`)}>
                    <div className="flex items-center space-x-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center ring-1 ring-white/10 group-hover:ring-blue-500/50 transition-all">
                        <Building2 className="text-blue-400" size={28} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors uppercase tracking-wide">{ws.name}</h3>
                        <p className="text-sm text-slate-500 flex items-center mt-1">
                          <span className="font-mono text-blue-500/70 mr-1">Code:</span> {ws.inviteCode}
                        </p>
                      </div>
                    </div>
                   <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:translate-x-1 transition-all">
                      <ArrowRight size={20} />
                   </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
