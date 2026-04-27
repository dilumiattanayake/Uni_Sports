import React, { useState } from 'react';
import AdminSportCoachAssignment from './AdminSportCoachAssignment';
import AdminLocationBookingManagement from './AdminLocationBookingManagement';

interface AdminDashboardProps {
  token: string;
  adminId: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ token, adminId }) => {
  const [activeTab, setActiveTab] = useState<'coaches' | 'bookings'>('coaches');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 sm:px-8 py-8 sm:py-12 text-white">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">🏆 Admin Dashboard</h1>
          <p className="text-blue-100">Manage coaches assignments and location booking requests</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6 bg-slate-900/40 p-4 rounded-lg border border-slate-700/80">
          <button
            onClick={() => setActiveTab('coaches')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'coaches'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            👥 Coach Assignments
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'bookings'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            📋 Location Bookings
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-slate-900/70 border border-slate-700/80 rounded-lg p-6">
          {/* Coach Assignments Tab */}
          {activeTab === 'coaches' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6">Assign Coaches to Sports</h2>
              <AdminSportCoachAssignment token={token} adminId={adminId} />
            </div>
          )}

          {/* Location Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6">Review Location Booking Requests</h2>
              <AdminLocationBookingManagement token={token} adminId={adminId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
