import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { StarRating } from '../components/StarRating';
import { SortableHeader } from '../components/SortableHeader';
import { Search, MapPin, Store as StoreIcon, Star, CheckCircle2 } from 'lucide-react';

interface UserStoreItem {
  id: string;
  name: string;
  email: string;
  address: string;
  overallRating: number;
  totalRatings: number;
  userRating: number | null;
}

export const UserStoresPage: React.FC = () => {
  const [stores, setStores] = useState<UserStoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Rating modal or inline submission toast
  const [activeRatingStore, setActiveRatingStore] = useState<UserStoreItem | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [ratingSuccess, setRatingSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await axiosClient.get(`/stores?${params.toString()}`);
      setStores(res.data.stores);
    } catch (err) {
      console.error('Failed to fetch stores for user', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [search, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleOpenRating = (store: UserStoreItem) => {
    setActiveRatingStore(store);
    setSelectedRating(store.userRating || 5);
  };

  const handleRatingSubmit = async () => {
    if (!activeRatingStore) return;
    setSubmitting(true);
    try {
      await axiosClient.post(`/stores/${activeRatingStore.id}/rating`, {
        rating: selectedRating,
      });

      setRatingSuccess(`Successfully submitted rating for ${activeRatingStore.name}!`);
      fetchStores();
      setActiveRatingStore(null);
      setTimeout(() => setRatingSuccess(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Registered Stores Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse registered businesses, view community overall ratings, and submit or modify your personal ratings.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-80">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by store name or address..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {ratingSuccess && (
        <div className="flex items-center space-x-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-medium animate-in fade-in">
          <CheckCircle2 size={20} className="text-emerald-600" />
          <span>{ratingSuccess}</span>
        </div>
      )}

      {/* Stores Table View */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <SortableHeader label="Store Name" field="name" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Address" field="address" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Overall Rating" field="overallRating" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                <SortableHeader label="Your Submitted Rating" field="userRating" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Loading stores...
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No stores found.
                  </td>
                </tr>
              ) : (
                stores.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-4 font-bold text-slate-900">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <StoreIcon size={16} />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{s.name}</div>
                          <div className="text-[11px] text-slate-400">{s.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-600 max-w-xs truncate" title={s.address}>
                      {s.address}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <StarRating rating={s.overallRating} size={16} />
                        <span className="font-bold text-slate-700 text-xs">
                          {s.overallRating} / 5 <span className="text-slate-400 font-normal">({s.totalRatings})</span>
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {s.userRating !== null ? (
                        <div className="flex items-center space-x-2 bg-amber-50 px-3 py-1 rounded-xl w-fit border border-amber-100">
                          <StarRating rating={s.userRating} size={16} />
                          <span className="font-bold text-amber-900 text-xs">{s.userRating} Stars</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not rated yet</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleOpenRating(s)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          s.userRating !== null
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        }`}
                      >
                        {s.userRating !== null ? 'Modify Rating' : 'Submit Rating'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rating Submission Modal */}
      {activeRatingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 space-y-5 border border-slate-100 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Star size={26} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 pt-2">
                {activeRatingStore.userRating !== null ? 'Modify Your Store Rating' : 'Rate Store'}
              </h3>
              <p className="text-xs text-slate-500">{activeRatingStore.name}</p>
            </div>

            <div className="flex flex-col items-center justify-center py-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <span className="text-xs font-semibold text-slate-500 uppercase">Select Rating (1 to 5 Stars)</span>
              <StarRating
                rating={selectedRating}
                interactive={true}
                onRatingSelect={(r) => setSelectedRating(r)}
                size={32}
              />
              <span className="text-sm font-bold text-amber-700">
                {selectedRating} Out of 5 Stars
              </span>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveRatingStore(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRatingSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
