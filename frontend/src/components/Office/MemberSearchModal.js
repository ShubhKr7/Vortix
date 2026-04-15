"use client";
import React, { useState } from "react";
import { Search, MapPin, X, User } from "lucide-react";

export default function MemberSearchModal({ isOpen, onClose, users, onTeleport, currentUserId }) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  // Filter users based on search term and exclude current user
  const otherUsers = Object.values(users).filter(
    (u) => 
      u.userId !== currentUserId && 
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900/90 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden glass glow shadow-blue-500/10 scale-in-center">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center tracking-tight">
              <User size={20} className="mr-2 text-blue-400" /> Member Directory
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-wider">Find and join your colleagues</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-white group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 bg-slate-900/50">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
              autoFocus
            />
          </div>
        </div>

        {/* User List */}
        <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
          {otherUsers.length > 0 ? (
            <div className="space-y-1">
              {otherUsers.map((member) => (
                <div 
                  key={member.userId}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/50 border border-transparent hover:border-slate-700 transition-all group mx-1"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform duration-200">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100">{member.name}</h3>
                      <div className="flex items-center text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                        Online Now
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      onTeleport(member);
                      onClose();
                    }}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95 group-hover:translate-x-[-4px]"
                  >
                    <MapPin size={14} />
                    <span>Teleport</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="bg-slate-800/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium">No active members found</p>
              <p className="text-slate-600 text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Active: {otherUsers.length + 1} users</p>
        </div>
      </div>
    </div>
  );
}
