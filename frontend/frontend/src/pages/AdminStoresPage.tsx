import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { SortableHeader } from '../components/SortableHeader';
import { StarRating } from '../components/StarRating';
import { AddStoreModal } from '../components/AddStoreModal';
import { PlusCircle, Filter, Store as StoreIcon, Mail, MapPin } from 'lucide-react';

interface StoreItem {
  id: string;
  name: string;
  email: string;
  address: string;
  rating: number;
  ratingCount: number;
  owner?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

export const AdminStoresPage: React.FC = () => {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterAddress, setFilterAddress] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterName) params.append('name', filterName);
      if (filterEmail) params.append('email', filterEmail);
      if (filterAddress) params.append('address', filterAddress);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await axiosClient.get(`/admin/stores?${params.toString()}`);
      setStores(res.data.stores);
    } catch (err) {
      console.error('Failed to fetch stores', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [filterName, filterEmail, filterAddress, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stores Management Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            View registered stores, overall customer ratings, assigned owners, and apply filters.
          </p>
        </div>
        <button
          onClick={() => setIsAddStoreOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl shadow-sm text-sm transition-all"
        >
          <PlusCircle size={18} />
          <span>Add New Store</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-700 font-semibold text-sm">
          <Filter size={18} className="text-blue-600" />
          <span>Filter & Search Stores</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Filter Store Name</label>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Search store name..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Filter Email</label>
            <input
              type="text"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              placeholder="Search store email..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Filter Address</label>
            <input
              type="text"
              value={filterAddress}
              onChange={(e) => setFilterAddress(e.target.value)}
              placeholder="Search store address..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <SortableHeader label="Store Name" field="name" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Store Email" field="email" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Address" field="address" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Overall Rating" field="rating" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Assigned Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Loading store listings...
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No stores found matching your criteria.
                  </td>
                </tr>
              ) : (
                stores.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center space-x-2">
                      <StoreIcon size={16} className="text-blue-600 shrink-0" />
                      <span>{s.name}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{s.email}</td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate" title={s.address}>
                      {s.address}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-2">
                        <StarRating rating={s.rating} size={16} />
                        <span className="font-bold text-slate-700 text-xs">
                          {s.rating} / 5 <span className="text-slate-400 font-normal">({s.ratingCount} reviews)</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {s.owner ? (
                        <div>
                          <p className="font-medium text-slate-800 text-xs">{s.owner.name}</p>
                          <p className="text-[11px] text-slate-400">{s.owner.email}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddStoreModal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        onStoreAdded={fetchStores}
      />
    </div>
  );
};
