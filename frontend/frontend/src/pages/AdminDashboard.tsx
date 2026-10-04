import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Users, Store, Star, UserPlus, PlusCircle, ArrowRight } from 'lucide-react';
import { AddUserModal } from '../components/AddUserModal';
import { AddStoreModal } from '../components/AddStoreModal';

interface Stats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
  pendingVendors: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await axiosClient.get('/admin/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-blue-200 font-semibold">System Administrator</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">Platform Control Dashboard</h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Overview of total registered users, active stores, pending vendor approvals, and administrative actions.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-2xl shadow-md text-sm transition-all"
          >
            <UserPlus size={18} />
            <span>Add New User</span>
          </button>

          <button
            onClick={() => setIsAddStoreOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-800/60 hover:bg-blue-800 text-white font-semibold rounded-2xl shadow-md text-sm border border-blue-400/30 transition-all"
          >
            <PlusCircle size={18} />
            <span>Add New Store</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Users */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Users size={24} />
            </div>
            <Link
              to="/admin/users"
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center space-x-1"
            >
              <span>Manage</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {loading ? '...' : stats?.totalUsers}
            </div>
            <p className="text-xs text-slate-500 mt-1">Admins, Store Owners & Normal Users</p>
          </div>
        </div>

        {/* Card 2: Pending Vendor Approvals */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Users size={24} />
            </div>
            <Link
              to="/admin/users?status=PENDING"
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center space-x-1"
            >
              <span>Approve</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Vendors</span>
            <div className="text-3xl font-extrabold text-amber-700 mt-1 flex items-center space-x-2">
              <span>{loading ? '...' : stats?.pendingVendors ?? 0}</span>
              {(stats?.pendingVendors ?? 0) > 0 && (
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  Action Required
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">Awaiting admin review</p>
          </div>
        </div>

        {/* Card 3: Stores */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Store size={24} />
            </div>
            <Link
              to="/admin/stores"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Manage</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Stores</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {loading ? '...' : stats?.totalStores}
            </div>
            <p className="text-xs text-slate-500 mt-1">Registered businesses on platform</p>
          </div>
        </div>

        {/* Card 4: Ratings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Star size={24} />
            </div>
            <span className="text-xs font-semibold text-slate-400">Platform Lifetime</span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Submitted Ratings</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {loading ? '...' : stats?.totalRatings}
            </div>
            <p className="text-xs text-slate-500 mt-1">User-submitted ratings (1 to 5 stars)</p>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/users"
          className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-purple-200 hover:shadow-md transition-all flex justify-between items-center"
        >
          <div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              User Directory & Details
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              View, filter by role/name/address/email, and inspect ratings for store owners.
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-600 flex items-center justify-center transition-colors">
            <ArrowRight size={20} />
          </div>
        </Link>

        <Link
          to="/admin/stores"
          className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all flex justify-between items-center"
        >
          <div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Store Directory & Ratings
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              View all stores with overall ratings, owner assignments, address, and filters.
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center transition-colors">
            <ArrowRight size={20} />
          </div>
        </Link>
      </div>

      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onUserAdded={fetchStats}
      />

      <AddStoreModal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        onStoreAdded={fetchStats}
      />
    </div>
  );
};
