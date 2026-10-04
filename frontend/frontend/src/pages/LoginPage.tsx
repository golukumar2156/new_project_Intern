import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "../context/AuthContext";
import axiosClient from "../api/axiosClient";
import {
  Store,
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  User,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("NORMAL_USER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await axiosClient.post("/auth/login", {
        email,
        password,
        role: selectedRole,
      });
      const { token, user } = res.data;
      login(token, user);

      // Redirect based on role
      if (user.role === "SYSTEM_ADMIN") {
        navigate("/admin/dashboard");
      } else if (user.role === "STORE_OWNER") {
        navigate("/owner/dashboard");
      } else {
        navigate("/stores");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to StoreRater
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">
          Select your role to log into your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 sm:px-10">
          {/* Role Selector Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole("NORMAL_USER");
                  setError(null);
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedRole === "NORMAL_USER"
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <User size={16} className="mb-1" />
                <span>User</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole("STORE_OWNER");
                  setError(null);
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedRole === "STORE_OWNER"
                    ? "bg-white text-amber-700 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <ShoppingBag size={16} className="mb-1" />
                <span>Store Owner</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole("SYSTEM_ADMIN");
                  setError(null);
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedRole === "SYSTEM_ADMIN"
                    ? "bg-white text-purple-700 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <ShieldCheck size={16} className="mb-1" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-start space-x-2 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedRole === "SYSTEM_ADMIN"
                      ? "admin@storerating.com"
                      : selectedRole === "STORE_OWNER"
                        ? "owner1@storerating.com"
                        : "user1@storerating.com"
                  }
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-semibold text-white transition-all disabled:opacity-50 ${
                  selectedRole === "SYSTEM_ADMIN"
                    ? "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                    : selectedRole === "STORE_OWNER"
                      ? "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500"
                      : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                }`}
              >
                <LogIn size={18} />
                <span>
                  {loading
                    ? "Signing in..."
                    : `Sign in as ${
                        selectedRole === "SYSTEM_ADMIN"
                          ? "Admin"
                          : selectedRole === "STORE_OWNER"
                            ? "Store Owner"
                            : "Normal User"
                      }`}
                </span>
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-500 font-medium">
                  Need an account?
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-center">
              <Link
                to="/signup"
                className="py-2.5 px-3 bg-slate-50 hover:bg-blue-50 text-blue-600 border border-slate-200 hover:border-blue-200 rounded-2xl text-xs font-semibold transition-all flex items-center justify-center space-x-1"
              >
                <User size={14} />
                <span>Normal User Signup</span>
              </Link>

              <Link
                to="/signup/owner"
                className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-2xl text-xs font-semibold transition-all flex items-center justify-center space-x-1"
              >
                <ShoppingBag size={14} />
                <span>Store Owner Signup</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
