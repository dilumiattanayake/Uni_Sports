import React, { useState, useEffect } from 'react';
import { registrationService } from '../../../services/registrationService';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Link } from 'react-router-dom';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  studentId?: string;
}

export default function StudentMyEvents() {
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Manage Modal State
  const [managingReg, setManagingReg] = useState<any | null>(null);
  const [editTeamMembers, setEditTeamMembers] = useState<TeamMember[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // --- FIX 1: Robust User ID Extraction ---
  // Checks common localStorage keys used in MERN apps to find your actual logged-in ID
  const getUserId = () => {
    try {
      const storageItem = localStorage.getItem('user') || localStorage.getItem('userInfo');
      if (storageItem) {
        const parsed = JSON.parse(storageItem);
        return parsed._id || parsed.id || '';
      }
    } catch (e) {
      console.error("Could not parse user from local storage");
    }
    return '';
  };
  const currentUserId = getUserId();

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const fetchMyRegistrations = async () => {
    try {
      setLoading(true);
      const response = await registrationService.getMyRegistrations();
      setMyRegistrations(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load your registered events');
    } finally {
      setLoading(false);
    }
  };

  // --- Manage Modal Handlers ---
  const openManageModal = (reg: any) => {
    setManagingReg(reg);
    setEditTeamMembers(reg.teamMembers || []);
    setSearchQuery('');
  };

  const handleSearchStudent = async () => {
    if (!searchQuery.trim()) return;
    try {
      setIsSearching(true);
      const response = await registrationService.searchStudent(searchQuery);
      const foundStudent = response.data; 

      if (editTeamMembers.some(m => m._id === foundStudent._id)) {
        return alert("This student is already on the team.");
      }
      setEditTeamMembers([...editTeamMembers, foundStudent]);
      setSearchQuery(''); 
    } catch (err: any) {
      alert(err.message || "Student not found.");
    } finally {
      setIsSearching(false);
    }
  };

  const removeMember = (idToRemove: string) => {
    setEditTeamMembers(editTeamMembers.filter(m => m._id !== idToRemove));
  };

  const submitTeamUpdate = async () => {
    if (!managingReg) return;
    const event = managingReg.event;
    const totalSize = editTeamMembers.length + 1; // +1 for captain

    if (totalSize < event.minTeamSize || totalSize > event.maxTeamSize) {
      return alert(`Team must be between ${event.minTeamSize} and ${event.maxTeamSize} members.`);
    }

    try {
      setIsUpdating(true);
      const memberIds = editTeamMembers.map(m => m._id);
      // NOTE: Ensure your registrationService has updateTeamMembers implemented
      await registrationService.updateTeamMembers(managingReg._id, memberIds);
      
      alert("Team updated successfully!");
      setManagingReg(null);
      fetchMyRegistrations();
    } catch (err: any) {
      alert(err.message || "Failed to update team.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!managingReg) return;
    if (window.confirm("Are you absolutely sure you want to cancel this registration? You will lose your spot entirely.")) {
      try {
        setIsUpdating(true);
        // NOTE: Ensure your registrationService has cancelRegistration implemented
        await registrationService.cancelRegistration(managingReg._id);
        alert("Registration cancelled.");
        setManagingReg(null);
        fetchMyRegistrations();
      } catch (err: any) {
        alert(err.message || "Failed to cancel.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  if (loading) return <DashboardLayout><div className="p-10 text-center text-gray-500 mt-20">Loading your events...</div></DashboardLayout>;
  if (error) return <DashboardLayout><div className="p-10 text-center text-red-500">{error}</div></DashboardLayout>;

  return (
      <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Registered Events</h1>
            <p className="text-gray-500 mt-1">Track your upcoming tournaments and manage your teams.</p>
          </div>
          <Link to="/student/events" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm">
            Browse More Events
          </Link>
        </div>

        {/* REGISTRATIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myRegistrations.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-5xl mb-4">🎫</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Yet</h3>
              <p className="text-gray-500 max-w-md mb-6">You haven't registered for any events.</p>
              <Link to="/student/events" className="px-6 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition">Find an Event</Link>
            </div>
          ) : (
            myRegistrations.map((reg) => {
              const event = reg.event || {};
              const isTeam = reg.registrationType === 'team';
              
              // --- FIX 2: Check ID safely whether populated or not ---
              const primaryId = typeof reg.primaryStudent === 'object' ? reg.primaryStudent._id : reg.primaryStudent;
              const isCaptain = primaryId === currentUserId;
              
              // --- FIX 3: Safe Date Check for TBA Events ---
              const isPastDeadline = event.registrationDeadline ? new Date() > new Date(event.registrationDeadline) : false;
              const isModifiable = event.status === 'upcoming' && !isPastDeadline;
              
              // Status Colors
              let statusConfig = { color: 'bg-gray-100 text-gray-700', label: 'Pending' };
              if (reg.status === 'confirmed') statusConfig = { color: 'bg-green-50 text-green-700', label: '✓ Confirmed' };
              if (reg.status === 'waitlisted') statusConfig = { color: 'bg-yellow-50 text-yellow-700', label: '⏳ Waitlisted' };
              if (reg.status === 'cancelled') statusConfig = { color: 'bg-red-50 text-red-700', label: '✕ Cancelled' };

              return (
                <div key={reg._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition">
                  <div className={`px-5 py-3 border-b flex justify-between items-center ${statusConfig.color}`}>
                    <span className="font-bold text-sm uppercase tracking-wide">{statusConfig.label}</span>
                    <span className="text-xs font-semibold opacity-80">{new Date(reg.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{event.title || 'Unknown Event'}</h3>

                    <div className="mt-3 mb-5 p-4 rounded-xl border border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${isTeam ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'}`}>
                          {isTeam ? '🏆 TEAM' : '👤 SOLO'}
                        </span>
                        {isTeam && (
                           <span className={`text-xs font-bold px-2 py-1 rounded ${isCaptain ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                             {isCaptain ? 'Captain' : 'Member'}
                           </span>
                        )}
                      </div>
                      
                      {isTeam && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Team Name</p>
                          <p className="text-base font-bold text-gray-900">{reg.teamName}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2.5 text-sm text-gray-600 mt-auto border-t border-gray-100 pt-4 mb-4">
                      <div className="flex items-center gap-3"><span className="text-lg">📅</span><span>{event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBA'}</span></div>
                      <div className="flex items-center gap-3"><span className="text-lg">📍</span><span className="truncate">{event.venue || 'TBA'}</span></div>
                    </div>

                    {/* FIX 4: Ensured button shows up for Solo registrations AND Team Captains */}
                    {(isCaptain || !isTeam) && isModifiable && reg.status !== 'cancelled' && (
                      <button 
                        onClick={() => openManageModal(reg)}
                        className="w-full py-2.5 border-2 border-indigo-100 text-indigo-600 rounded-lg font-bold text-sm hover:bg-indigo-50 transition"
                      >
                        Manage Registration
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* MANAGE REGISTRATION MODAL                                         */}
        {/* ----------------------------------------------------------------- */}
        {managingReg && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Manage Registration</h2>
              <p className="text-gray-600 text-sm mb-6">{managingReg.event?.title}</p>
              
              {/* If Team Event, show Member Editor */}
              {managingReg.registrationType === 'team' && (
                <div className="mb-6 space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Team Name</p>
                    <p className="text-base font-bold text-gray-900">{managingReg.teamName}</p>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-bold text-gray-700">Edit Team Members</label>
                      <span className={`text-xs font-semibold ${editTeamMembers.length + 1 >= managingReg.event.minTeamSize ? 'text-green-600' : 'text-red-500'}`}>
                        {editTeamMembers.length + 1} / {managingReg.event.maxTeamSize} Members
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {/* Captain */}
                      <div className="flex justify-between items-center p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                        <span className="text-sm font-medium text-indigo-900">👤 You (Captain)</span>
                      </div>

                      {/* Members */}
                      {editTeamMembers.map((member) => (
                        <div key={member._id} className="flex justify-between items-center p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                          <button onClick={() => removeMember(member._id)} className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 bg-red-50 rounded">
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Search Input */}
                    {editTeamMembers.length + 1 < managingReg.event.maxTeamSize && (
                      <div className="flex gap-2">
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchStudent()} placeholder="Search by Email/ID" className="flex-grow border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                        <button type="button" onClick={handleSearchStudent} disabled={isSearching || !searchQuery.trim()} className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50">
                          {isSearching ? '...' : 'Add'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-gray-100 pt-6 space-y-3">
                {managingReg.registrationType === 'team' && (
                  <button onClick={submitTeamUpdate} disabled={isUpdating} className="w-full px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
                    {isUpdating ? 'Saving...' : 'Save Team Changes'}
                  </button>
                )}
                
                <button onClick={handleCancelRegistration} disabled={isUpdating} className="w-full px-5 py-2.5 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition">
                  {isUpdating ? 'Processing...' : 'Cancel Entire Registration'}
                </button>

                <button onClick={() => setManagingReg(null)} disabled={isUpdating} className="w-full px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
  );
}