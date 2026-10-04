import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { SortableHeader } from '../components/SortableHeader';
import { StarRating } from '../components/StarRating';
import { AddUserModal } from '../components/AddUserModal';
import { UserPlus, Filter, Info, CheckCircle2, XCircle, Clock, ShieldAlert } from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  address: string;
  role: 'SYSTEM_ADMIN' | 'NORMAL_USER' | 'STORE_OWNER';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  rating: number | null;
  storeName?: string | null;
  createdAt: string;
}

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterAddress, setFilterAddress] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterName) params.append('name', filterName);
      if (filterEmail) params.append('email', filterEmail);
      if (filterAddress) params.append('address', filterAddress);
      if (filterRole) params.append('role', filterRole);
      if (filterStatus) params.append('status', filterStatus);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await axiosClient.get(`/admin/users?${params.toString()}`);
      setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterName, filterEmail, filterAddress, filterRole, filterStatus, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleUpdateStatus = async (userId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await axiosClient.patch(`/admin/users/${userId}/status`, { status });
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user status', err);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium">System Admin</span>;
      case 'STORE_OWNER':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-medium">Store Owner</span>;
      case 'NORMAL_USER':
        return <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">Normal User</span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-medium">
            <CheckCircle2 size={13} />
            <span>Approved</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-full font-medium animate-pulse">
            <Clock size={13} />
            <span>Pending Approval</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center space-x-1 bg-rose-100 text-rose-800 text-xs px-2.5 py-1 rounded-full font-medium">
            <XCircle size={13} />
            <span>Rejected</span>
          </span>
        );
      default:
        return <span className="text-slate-400 text-xs">—</span>;
    }
  };

  const pendingVendors = users.filter((u) => u.role === 'STORE_OWNER' && u.status === 'PENDING');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Users Management Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            View, filter, sort all platform accounts and approve vendor applications.
          </p>
        </div>
        <button
          onClick={() => setIsAddUserOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl shadow-sm text-sm transition-all"
        >
          <UserPlus size={18} />
          <span>Add New User</span>
        </button>
      </div>

      {/* Pending Vendor Alert Section */}
      {pendingVendors.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
            <ShieldAlert size={20} className="text-amber-600" />
            <span>Pending Vendor Approval Requests ({pendingVendors.length})</span>
          </div>
          <p className="text-xs text-amber-800">
            The following Store Owners registered online and are awaiting Administrator approval:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingVendors.map((pv) => (
              <div
                key={pv.id}
                className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">{pv.name}</div>
                  <div className="text-xs text-slate-500">{pv.email}</div>
                  {pv.storeName && (
                    <div className="text-xs font-semibold text-amber-700 mt-0.5">
                      Store: {pv.storeName}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateStatus(pv.id, 'APPROVED')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center space-x-1"
                  >
                    <CheckCircle2 size={14} />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(pv.id, 'REJECTED')}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl transition-all flex items-center space-x-1"
                  >
                    <XCircle size={14} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-700 font-semibold text-sm">
          <Filter size={18} className="text-blue-600" />
          <span>Filters & Search</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Filter Name</label>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Filter Email</label>
            <input
              type="text"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              placeholder="Search by email..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Filter Address</label>
            <input
              type="text"
              value={filterAddress}
              onChange={(e) => setFilterAddress(e.target.value)}
              placeholder="Search by address..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Filter Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="">All Roles</option>
              <option value="NORMAL_USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="SYSTEM_ADMIN">System Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Vendor Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending Approval</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <SortableHeader label="Name" field="name" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Email" field="email" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Address" field="address" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Role" field="role" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Approval Status" field="status" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Rating (Store Owner)" field="rating" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading users directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      {u.name}
                      {u.storeName && (
                        <div className="text-[11px] text-amber-800 font-normal">
                          Store: {u.storeName}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate" title={u.address}>
                      {u.address}
                    </td>
                    <td className="px-4 py-3.5">{getRoleBadge(u.role)}</td>
                    <td className="px-4 py-3.5">{getStatusBadge(u.status)}</td>
                    <td className="px-4 py-3.5">
                      {u.role === 'STORE_OWNER' ? (
                        u.rating !== null ? (
                          <div className="flex items-center space-x-2">
                            <StarRating rating={u.rating} size={16} />
                            <span className="font-bold text-slate-700 text-xs">{u.rating} / 5</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-normal">No Store / Ratings</span>
                        )
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1">
                      {u.role === 'STORE_OWNER' && u.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(u.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors"
                            title="Approve Store Owner"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(u.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 font-medium text-xs rounded-lg transition-colors"
                            title="Reject Store Owner"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {u.role === 'STORE_OWNER' && u.status === 'REJECTED' && (
                        <button
                          onClick={() => handleUpdateStatus(u.id, 'APPROVED')}
                          className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-medium text-xs rounded-lg transition-colors"
                          title="Re-approve Vendor"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors inline-flex items-center"
                        title="View Full Details"
                      >
                        <Info size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 space-y-4 border border-slate-100 animate-in fade-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">User Account Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs uppercase font-semibold text-slate-400">Full Name</span>
                <p className="font-medium text-slate-800">{selectedUser.name}</p>
              </div>

              <div>
                <span className="text-xs uppercase font-semibold text-slate-400">Email Address</span>
                <p className="font-medium text-slate-800">{selectedUser.email}</p>
              </div>

              <div>
                <span className="text-xs uppercase font-semibold text-slate-400">Role & Approval Status</span>
                <div className="mt-1 flex items-center space-x-2">
                  {getRoleBadge(selectedUser.role)}
                  {getStatusBadge(selectedUser.status)}
                </div>
              </div>

              <div>
                <span className="text-xs uppercase font-semibold text-slate-400">Physical Address</span>
                <p className="font-medium text-slate-800">{selectedUser.address}</p>
              </div>

              {selectedUser.role === 'STORE_OWNER' && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 space-y-1">
                  <span className="text-xs font-semibold text-amber-800 uppercase">Store Rating Overview</span>
                  {selectedUser.storeName && (
                    <p className="text-xs text-amber-900 font-medium">Store: {selectedUser.storeName}</p>
                  )}
                  {selectedUser.rating !== null ? (
                    <div className="flex items-center space-x-2 pt-1">
                      <StarRating rating={selectedUser.rating} size={18} />
                      <span className="font-bold text-amber-900 text-sm">{selectedUser.rating} / 5 Average Rating</span>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-700">No ratings submitted yet for this owner's store.</p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              {selectedUser.role === 'STORE_OWNER' && selectedUser.status === 'PENDING' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedUser.id, 'APPROVED');
                      setSelectedUser(null);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Approve Vendor
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedUser.id, 'REJECTED');
                      setSelectedUser(null);
                    }}
                    className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-semibold"
                  >
                    Reject
                  </button>
                </div>
              )}
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-colors ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onUserAdded={fetchUsers}
      />
    </div>
  );
};

