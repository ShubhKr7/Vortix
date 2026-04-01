"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import useWorkspaceStore from "@/store/workspaceStore";
import usePresenceStore from "@/store/presenceStore";
import VirtualOffice from "@/components/Office/VirtualOffice";
import { ArrowLeft, Users, Shield, Copy, Check, Loader2, Mic, MicOff } from "lucide-react";
import api from "@/lib/api";

export default function OfficePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();
  const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();
  const { initSocket, joinWorkspace, disconnect } = usePresenceStore();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadWorkspace = async () => {
      try {
        const { data } = await api.get(`/workspaces/${id}`);
        setCurrentWorkspace(data);
        initSocket(token);
        joinWorkspace(id);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load workspace", err);
        router.push("/dashboard");
      }
    };

    loadWorkspace();

    return () => {
      disconnect();
    };
  }, [id, isAuthenticated, token, initSocket, joinWorkspace, disconnect, setCurrentWorkspace, router]);

  const copyInvite = () => {
    navigator.clipboard.writeText(currentWorkspace?.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-950">
      <Loader2 className="animate-spin text-blue-500" size={48} />
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 z-20 shadow-lg">
        <div className="flex items-center space-x-6">
          <button onClick={() => router.push("/dashboard")} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Shield size={16} className="text-white" />
             </div>
             <div>
                <h1 className="text-sm font-bold tracking-widest uppercase text-slate-100">{currentWorkspace?.name}</h1>
                <p className="text-[10px] text-slate-500 font-mono tracking-tighter">ID: {id}</p>
             </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
           <button 
             onClick={() => setMuted(!muted)} 
             className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold text-xs transition-all ring-1 ring-white/10 ${muted ? "bg-red-600/20 text-red-400 hover:bg-red-600/30 ring-red-500/30" : "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 ring-emerald-500/30"}`}
           >
             {muted ? <MicOff size={14} /> : <Mic size={14} />}
             <span>{muted ? "MUTED" : "UNMUTED"}</span>
           </button>

           <div className="h-8 w-[1px] bg-slate-800 hidden sm:block"></div>

           <button onClick={copyInvite} className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-all text-xs font-semibold ring-1 ring-white/5 active:scale-95">
             {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
             <span>{copied ? "COPIED" : `INVITE: ${currentWorkspace?.inviteCode}`}</span>
           </button>
           
           <div className="flex -space-x-2">
             {currentWorkspace?.members.slice(0, 3).map((m, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-blue-400 ring-1 ring-white/10" title={m.name}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
             ))}
             {currentWorkspace?.members.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                  +{currentWorkspace.members.length - 3}
                </div>
             )}
           </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 relative bg-[radial-gradient(circle_at_center,_rgba(30,41,59,0.3)_0%,_transparent_70%)]">
        <VirtualOffice workspaceId={id} muted={muted} />
      </main>
      
      {/* Legend / Status */}
      <div className="absolute bottom-6 right-6 z-10 glass p-5 rounded-2xl glow max-w-xs transition-all hover:translate-y-[-4px]">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Status Panel</h4>
          <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Connected Users</span>
                  <span className="text-blue-400 font-bold flex items-center"><Users size={12} className="mr-1" /> {currentWorkspace?.members.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Network Latency</span>
                  <span className="text-emerald-400 font-bold">24ms</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Audio Stream</span>
                  <span className={muted ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>{muted ? "Standby" : "Active"}</span>
              </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800">
              <p className="text-[10px] text-slate-600 leading-relaxed italic">Use arrow keys or click to move on the grid. Proximity audio connects automatically.</p>
          </div>
      </div>
    </div>
  );
}
