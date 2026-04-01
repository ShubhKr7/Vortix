"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import Link from "next/link";
import { UserPlus, ArrowRight, User, Mail, Lock } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const signup = useAuthStore((state) => state.signup);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password, name);
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-8 glass p-8 rounded-2xl shadow-2xl glow">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/20 text-blue-500 mb-4 ring-1 ring-blue-500/20">
            <UserPlus size={32} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Create Account</h2>
          <p className="mt-2 text-sm text-slate-400">Join the virtual workspace today</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>}
          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="text"
                required
                className="block w-full pl-10 pr-3 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="relative group">
              <Mail className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="email"
                required
                className="block w-full pl-10 pr-3 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="password"
                required
                className="block w-full pl-10 pr-3 py-3 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
          >
            Sign up <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
        
        <p className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-500 hover:text-blue-400 transition-colors">Log in</Link>
        </p>
      </div>
    </div>
  );
}
