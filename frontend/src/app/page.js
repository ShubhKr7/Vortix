"use client";
import { Building2, ArrowRight, Zap, Shield, Users } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      <nav className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/40">
                <Building2 className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">Virtual Office</span>
        </div>
        <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Login</Link>
            <Link href="/signup" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95">Sign Up</Link>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-20 pb-32 max-w-4xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-8">
            <Zap size={14} />
            <span>Next-Gen Remote Work</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
          The Workspace That <br /> Feels Like an Office.
        </h1>
        
        <p className="text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
          Simulate a real-world office with 2D avatars, real-time presence, and proximity-based audio. Feel the presence of your team without the Zoom fatigue.
        </p>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/signup" className="group px-8 py-4 bg-slate-100 hover:bg-white text-slate-950 rounded-2xl font-bold flex items-center shadow-2xl transition-all hover:-translate-y-1 active:scale-95">
                Build Your Office <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="px-8 py-4 glass rounded-2xl font-bold flex items-center border-slate-800 transition-all hover:bg-slate-800/50">
                Learn More
            </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full text-left">
            <div className="glass p-8 rounded-3xl border-slate-800">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
                    <Users size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">Real-time Presence</h3>
                <p className="text-slate-500 text-sm leading-relaxed">See your colleagues moving around the office in real-time. Know who is available at a glance.</p>
            </div>
            <div className="glass p-8 rounded-3xl border-slate-800">
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 mb-6">
                    <Zap size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">Proximity Audio</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Audio connects naturally as you approach someone. Stop talking by simply walking away.</p>
            </div>
            <div className="glass p-8 rounded-3xl border-slate-800">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6">
                    <Shield size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">Private Workspaces</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Create focus zones and meeting rooms with isolated audio. Best-in-class security for your team.</p>
            </div>
        </div>
      </main>
      
      <footer className="relative z-10 border-t border-slate-900 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                  <div className="w-6 h-6 bg-slate-800 rounded-md flex items-center justify-center">
                    <Building2 size={12} className="text-slate-400" />
                  </div>
                  <span className="font-bold text-slate-400">Virtual Office MVP</span>
              </div>
              <p>&copy; 2026 Vortix Labs. Built for next-gen collaboration.</p>
          </div>
      </footer>
    </div>
  );
}
