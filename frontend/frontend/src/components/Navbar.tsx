import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ChangePasswordModal } from "./ChangePasswordModal";
import {
  Store,
  Users,
  LayoutDashboard,
  LogOut,
  KeyRound,
  User as UserIcon,
  ShoppingBag,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SYSTEM_ADMIN":
        return (
          <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
            System Admin
          </span>
        );
      case "STORE_OWNER":
        return (
          <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
            Store Owner
          </span>
        );
      case "NORMAL_USER":
        return (
          <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
            User
          </span>
        );
      default:
        return null;
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Left Brand Logo & Title */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2.5 group">
                <span className="text-lg font-bold text-slate-900 tracking-tight">
                  StoreRater
                </span>
              </Link>

              {/* Navigation Links based on Role */}
              <div className="hidden md:flex items-center space-x-1">
                {user.role === "SYSTEM_ADMIN" && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                        isActive("/admin/dashboard")
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <LayoutDashboard size={18} />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      to="/admin/stores"
                      className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                        isActive("/admin/stores")
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <ShoppingBag size={18} />
                      <span>Stores</span>
                    </Link>

                    <Link
                      to="/admin/users"
                      className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                        isActive("/admin/users")
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Users size={18} />
                      <span>Users</span>
                    </Link>
                  </>
                )}

                {user.role === "NORMAL_USER" && (
                  <Link
                    to="/stores"
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive("/stores")
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <ShoppingBag size={18} />
                    <span>Browse Registered Stores</span>
                  </Link>
                )}

                {user.role === "STORE_OWNER" && (
                  <Link
                    to="/owner/dashboard"
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive("/owner/dashboard")
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <LayoutDashboard size={18} />
                    <span>Store Dashboard</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Right Profile & Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 border-r border-slate-200 pr-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <UserIcon size={18} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-[180px]">
                    {user.name}
                  </div>
                  <div>{getRoleBadge(user.role)}</div>
                </div>
              </div>

              <button
                onClick={() => setIsPasswordModalOpen(true)}
                title="Change Password"
                className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <KeyRound size={15} />
                <span className="hidden sm:inline">Password</span>
              </button>

              <button
                onClick={handleLogout}
                title="Log Out"
                className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};
