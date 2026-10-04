import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { StarRating } from '../components/StarRating';
import { SortableHeader } from '../components/SortableHeader';
import { Store, Star, Users, MapPin, Mail, AlertCircle } from 'lucide-react';

interface RatingUser {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAddress: string;
  rating: number;
  submittedAt: string;
}

interface OwnerDashboardData {
  hasStore: boolean;
  store: {
    id: string;
    name: string;
    email: string;
    address: string;
  } | null;
  averageRating: number;
  totalRatings: number;
  ratingUsers: RatingUser[];
}

export const OwnerDashboard: React.FC = () => {
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Sorting
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await axiosClient.get(`/owner/dashboard?${params.toString()}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch owner dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading Store Owner Dashboard...
      </div>
    );
  }

  if (!data || !data.hasStore || !data.store) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">No Store Assigned Yet</h2>
        <p className="text-slate-500 text-sm">
          You are logged in as a Store Owner, but a store has not been assigned to your account by the System Administrator yet.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Store Owner Portal</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">{data.store.name}</h1>
          <p className="text-slate-300 text-sm mt-1 flex items-center space-x-2">
            <MapPin size={16} className="text-slate-400 shrink-0" />
            <span>{data.store.address}</span>
          </p>
        </div>

        {/* Average Rating KPI Badge */}
        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
            <Star size={24} className="fill-slate-900" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{data.averageRating} / 5</div>
            <div className="text-xs text-amber-300 font-medium">
              Average Rating ({data.totalRatings} user reviews)
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Submissions List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">User Rating Submissions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              List of users who submitted rating feedback for your store.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            Total Reviews: {data.totalRatings}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <SortableHeader label="User Name" field="userName" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader label="User Email" field="userEmail" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">User Address</th>
                  <SortableHeader label="Rating Submitted" field="rating" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                  <SortableHeader label="Submitted Date" field="submittedAt" currentSortBy={sortBy} currentSortOrder={sortOrder} onSort={handleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data.ratingUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No ratings submitted for your store yet.
                    </td>
                  </tr>
                ) : (
                  data.ratingUsers.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-slate-900">{r.userName}</td>
                      <td className="px-4 py-3.5 text-slate-600">{r.userEmail}</td>
                      <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate" title={r.userAddress}>
                        {r.userAddress}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-2">
                          <StarRating rating={r.rating} size={16} />
                          <span className="font-bold text-slate-700 text-xs">{r.rating} Stars</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs">
                        {new Date(r.submittedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
