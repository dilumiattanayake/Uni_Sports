import React, { useState, useEffect } from 'react';
import { eventService } from '../../../services/eventService';
import { registrationService } from '../../../services/registrationService';
import { DashboardLayout } from "@/components/DashboardLayout";

// Define the shape of a team member for the UI
interface TeamMember {
  _id: string;
  name: string;
  email: string;
  studentId?: string;
}

export default function StudentEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null); // For Registration
  const [viewingEventDetails, setViewingEventDetails] = useState<any | null>(null); // NEW: For Details View
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Team Form State
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchEventsData();
  }, []);

  const fetchEventsData = async () => {
    try {
      setLoading(true);
      const [allEventsRes, myRegsRes] = await Promise.all([
        eventService.getAll(),
        registrationService.getMyRegistrations()
      ]);

      const allEvents = allEventsRes.data || [];
      const myRegistrations = myRegsRes.data || [];

      const mergedEvents = allEvents.map((ev: any) => {
        const myReg = myRegistrations.find((reg: any) => 
          (reg.event?._id || reg.event) === ev._id
        );
        return {
          ...ev,
          myRegistrationStatus: myReg ? myReg.status : null,
          myRegistrationType: myReg ? myReg.registrationType : null,
          myTeamName: myReg ? myReg.teamName : null
        };
      });

      setEvents(mergedEvents);
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const openRegistrationModal = (event: any) => {
    setViewingEventDetails(null); // Close details modal if open
    setSelectedEvent(event);
    setTeamName('');
    
    if (event.eventType === 'team') {
      const requiredMembers = Math.max(0, event.minTeamSize - 1);
      setTeamMembers(Array(requiredMembers).fill(''));
    } else {
      setTeamMembers([]);
    }
    setSearchQuery('');
  };

  const openDetailsModal = (event: any) => {
    setViewingEventDetails(event);
  };

  // --- Dynamic Team Member Handlers ---
  const handleSearchStudent = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      const response = await registrationService.searchStudent(searchQuery);
      const foundStudent = response.data; 

      if (teamMembers.some(m => m._id === foundStudent._id)) {
        return alert("This student is already added to your team.");
      }

      setTeamMembers([...teamMembers, foundStudent]);
      setSearchQuery(''); 
    } catch (err: any) {
      alert(err.message || "Student not found or cannot be added.");
    } finally {
      setIsSearching(false);
    }
  };

  const removeMember = (idToRemove: string) => {
    setTeamMembers(teamMembers.filter(m => m._id !== idToRemove));
  };

  const handleRegister = async () => {
    if (!selectedEvent) return;

    if (selectedEvent.eventType === 'team') {
      if (!teamName.trim()) {
        return alert("Please enter a Team Name to register.");
      }
      
      const totalTeamSize = teamMembers.length + 1; 
      if (totalTeamSize < selectedEvent.minTeamSize || totalTeamSize > selectedEvent.maxTeamSize) {
        return alert(`Team must be between ${selectedEvent.minTeamSize} and ${selectedEvent.maxTeamSize} members (including you).`);
      }
    }
    
    try {
      setIsRegistering(true);
      
      const payload: any = {
        registrationType: selectedEvent.eventType,
      };

      if (selectedEvent.eventType === 'team') {
        payload.teamName = teamName;
        payload.teamMembers = teamMembers.map(member => member._id);
      }

      await registrationService.registerForEvent(selectedEvent._id, payload);
      
      alert("Successfully registered!");
      setSelectedEvent(null);
      fetchEventsData();
    } catch (err: any) {
      alert(err.message || "Failed to register. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnregister = async (eventId: string) => {
    if (window.confirm("Are you sure you want to cancel your registration? If there is a waitlist, you will lose your spot.")) {
      try {
        await eventService.delete(eventId); 
        alert("Registration cancelled.");
        fetchEventsData();
      } catch (err: any) {
        alert(err.message || "Failed to cancel registration.");
      }
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Loading upcoming events...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
      <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">University Events</h1>
          <p className="text-gray-500 mt-1">Discover and register for upcoming sports tournaments and activities.</p>
        </div>

        {/* EVENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
              No upcoming events at the moment.
            </div>
          ) : (
            events.map(event => {
              const confirmedCount = event.confirmedCount || 0;
              const isFull = confirmedCount >= event.maxParticipants;
              const isPastDeadline = new Date() > new Date(event.registrationDeadline);
              const isOpen = event.status === 'upcoming' && !isPastDeadline;

              return (
                <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition">
                  {/* Banner Image Area */}
                  <div 
                    onClick={() => openDetailsModal(event)}
                    className="h-40 bg-gray-100 relative border-b border-gray-100 cursor-pointer group"
                  >
                    {event.imageUrl ? (
                      <img src={`http://localhost:5000${event.imageUrl}`} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm">No Banner Image</div>
                    )}
                    
                    <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold uppercase tracking-wide rounded shadow-sm border ${
                        event.status === 'upcoming' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                        event.status === 'ongoing' ? 'bg-green-100 text-green-800 border-green-200' : 
                        event.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' : 
                        'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {event.status}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <h3 onClick={() => openDetailsModal(event)} className="text-xl font-bold text-gray-900 mb-1 leading-tight line-clamp-1 cursor-pointer hover:text-indigo-600 transition">{event.title}</h3>
                    <p className="text-sm font-semibold text-indigo-600 mb-3">{event.sport?.name || 'General Event'}</p>
                    
                    <div className="mb-4">
                      <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded">
                        {event.eventType === 'team' 
                          ? `🏆 Team Event (${event.minTeamSize}-${event.maxTeamSize} players)` 
                          : '👤 Solo Event'}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-2 mb-6 border-l-2 border-indigo-100 pl-3">
                      <p>📅 {new Date(event.startDate).toLocaleDateString()} &mdash; {new Date(event.endDate).toLocaleDateString()}</p>
                      <p className="truncate">📍 {event.venue}</p>
                    </div>

                    <div className="mt-auto mb-4 space-y-2">
                      <div className="flex justify-between text-xs font-medium text-gray-700">
                        <span>{event.eventType === 'team' ? 'Teams Registered' : 'Slots Filled'}</span>
                        <span>{confirmedCount} / {event.maxParticipants}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(100, (confirmedCount / event.maxParticipants) * 100)}%` }}></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex gap-2">
                      {/* NEW: View Details Button */}
                      <button 
                        onClick={() => openDetailsModal(event)}
                        className="w-1/3 py-2.5 rounded-lg font-bold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                      >
                        Details
                      </button>

                      {/* Register/Status Button */}
                      {event.myRegistrationStatus ? (
                        <button disabled className={`w-2/3 py-2.5 border rounded-lg font-bold text-xs cursor-not-allowed ${
                          event.myRegistrationStatus === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                          event.myRegistrationStatus === 'waitlisted' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {event.myRegistrationStatus === 'confirmed' ? '✓ Confirmed' : '⏳ Waitlisted'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => openRegistrationModal(event)}
                          disabled={!isOpen}
                          className={`w-2/3 py-2.5 rounded-lg font-bold text-sm transition ${
                            isOpen ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {!isOpen ? 'Closed' : isFull ? 'Waitlist' : 'Register'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* NEW: EVENT DETAILS MODAL                                        */}
        {/* ----------------------------------------------------------------- */}
        {viewingEventDetails && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
              
              {/* Modal Banner Image */}
              <div className="h-48 md:h-64 bg-gray-100 relative shrink-0">
                {viewingEventDetails.imageUrl ? (
                  <img src={`http://localhost:5000${viewingEventDetails.imageUrl}`} alt={viewingEventDetails.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image Available</div>
                )}
                <button 
                  onClick={() => setViewingEventDetails(null)}
                  className="absolute top-4 right-4 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black transition"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 md:p-8 overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{viewingEventDetails.title}</h2>
                    <p className="text-indigo-600 font-semibold text-sm mt-1">{viewingEventDetails.sport?.name}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full border ${
                        viewingEventDetails.status === 'upcoming' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                        viewingEventDetails.status === 'ongoing' ? 'bg-green-100 text-green-800 border-green-200' : 
                        viewingEventDetails.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' : 
                        'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {viewingEventDetails.status}
                  </span>
                </div>

                <div className="mb-6">
                  <span className="inline-block bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200">
                    {viewingEventDetails.eventType === 'team' 
                      ? `🏆 Team Event (Required: ${viewingEventDetails.minTeamSize}-${viewingEventDetails.maxTeamSize} players)` 
                      : '👤 Solo / Individual Event'}
                  </span>
                </div>

                <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
                  <p className="whitespace-pre-wrap">{viewingEventDetails.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-xl border border-gray-100 mb-6 text-sm">
                  <div>
                    <p className="text-gray-500 uppercase text-xs font-bold mb-1">Location</p>
                    <p className="font-semibold text-gray-900">{viewingEventDetails.venue}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase text-xs font-bold mb-1">Registration Deadline</p>
                    <p className="font-semibold text-red-600">{new Date(viewingEventDetails.registrationDeadline).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase text-xs font-bold mb-1">Start Date</p>
                    <p className="font-semibold text-gray-900">{new Date(viewingEventDetails.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase text-xs font-bold mb-1">Capacity</p>
                    <p className="font-semibold text-gray-900">{viewingEventDetails.confirmedCount || 0} / {viewingEventDetails.maxParticipants} Registered</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-6 border-t border-gray-100 bg-white flex justify-end shrink-0 gap-3">
                <button 
                  onClick={() => setViewingEventDetails(null)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Close
                </button>
                
                {/* Registration button inside details modal */}
                {!viewingEventDetails.myRegistrationStatus && viewingEventDetails.status === 'upcoming' && new Date() <= new Date(viewingEventDetails.registrationDeadline) && (
                  <button 
                    onClick={() => openRegistrationModal(viewingEventDetails)}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                  >
                    Register Now
                  </button>
                )}
              </div>
            </div>
          </div>
        )}


        {/* ----------------------------------------------------------------- */}
        {/* NATIVE REGISTRATION MODAL (Kept exactly the same as previous)   */}
        {/* ----------------------------------------------------------------- */}
        {selectedEvent && (
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Confirm Registration</h2>
              <p className="text-gray-600 text-sm mb-6">Complete your registration for this event.</p>
              
              {/* Event Summary Box with Event Status */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6 space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 block text-xs uppercase font-bold tracking-wider">Event</span>
                  <span className="font-semibold text-gray-900 text-base">{selectedEvent.title}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                  <div>
                    <span className="text-gray-500 block text-xs uppercase font-bold tracking-wider">Event Status</span>
                    <span className={`font-bold capitalize ${
                      selectedEvent.status === 'upcoming' ? 'text-blue-600' : 
                      selectedEvent.status === 'ongoing' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {selectedEvent.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs uppercase font-bold tracking-wider">Type</span>
                    <span className="font-medium text-gray-900 capitalize">{selectedEvent.eventType}</span>
                  </div>
                </div>
              </div>

              {/* TEAM REGISTRATION SECTION */}
              {selectedEvent.eventType === 'team' && (
                <div className="mb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Team Name *</label>
                    <input 
                      type="text" 
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Enter your team's name"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-bold text-gray-700">Team Members</label>
                      <span className={`text-xs font-semibold ${teamMembers.length + 1 >= selectedEvent.minTeamSize ? 'text-green-600' : 'text-red-500'}`}>
                        {teamMembers.length + 1} / {selectedEvent.maxTeamSize} Members
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-3">
                      You are the Captain. Search by University ID or Email to add members. Minimum team size is {selectedEvent.minTeamSize}.
                    </p>

                    {/* Member List */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                        <span className="text-sm font-medium text-indigo-900">👤 You (Team Captain)</span>
                      </div>

                      {teamMembers.map((member) => (
                        <div key={member._id} className="flex justify-between items-center p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                          <button 
                            onClick={() => removeMember(member._id)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 bg-red-50 rounded"
                            title="Remove Member"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Search Input */}
                    {teamMembers.length + 1 < selectedEvent.maxTeamSize && (
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearchStudent()}
                          placeholder="Enter Email or Student ID"
                          className="flex-grow border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                        />
                        <button 
                          type="button"
                          onClick={handleSearchStudent}
                          disabled={isSearching || !searchQuery.trim()}
                          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
                        >
                          {isSearching ? '...' : 'Add'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Waitlist Warning */}
              {((selectedEvent.confirmedCount || 0) >= selectedEvent.maxParticipants) && (
                <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800 font-medium">
                    ⚠️ This event is currently full. By continuing, you will be placed on the <strong>waitlist</strong>. You will be automatically confirmed if a spot opens up.
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setSelectedEvent(null)}
                  disabled={isRegistering}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRegister}
                  disabled={isRegistering}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-70"
                >
                  {isRegistering ? 'Processing...' : 'Confirm Registration'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
  );
}