import React, { useState, useEffect } from 'react';
import { eventService } from '../../../services/eventService';
import { sportService } from '../../../services/sportService';
import { DashboardLayout } from "@/components/DashboardLayout";

// --- TypeScript Interfaces ---
interface Sport {
  _id: string;
  name: string;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  sport: Sport;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  venue: string;
  maxParticipants: number;
  eventType: 'solo' | 'team'; // NEW
  minTeamSize?: number;       // NEW
  maxTeamSize?: number;       // NEW
  registrationFormUrl?: string;
  status: string;
  imageUrl?: string;
  confirmedCount?: number;
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    venue: '',
    maxParticipants: 10,
    eventType: 'solo' as 'solo' | 'team', // NEW
    minTeamSize: 2, // NEW Default
    maxTeamSize: 5, // NEW Default
    registrationFormUrl: '',
    status: 'upcoming',
    image: null as File | null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, sportsRes] = await Promise.all([
        eventService.getAll(),
        sportService.getAll()
      ]);
      
      const eventsData = (eventsRes as any).data || eventsRes || [];
      const sportsData = (sportsRes as any).data || sportsRes || [];
      
      setEvents(eventsData);
      setSports(sportsData);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const openEditModal = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description,
      sport: event.sport?._id || '',
      startDate: formatDateForInput(event.startDate),
      endDate: formatDateForInput(event.endDate),
      registrationDeadline: formatDateForInput(event.registrationDeadline),
      venue: event.venue,
      maxParticipants: event.maxParticipants,
      eventType: event.eventType || 'solo',
      minTeamSize: event.minTeamSize || 2,
      maxTeamSize: event.maxTeamSize || 5,
      registrationFormUrl: event.registrationFormUrl || '',
      status: event.status,
      image: null
    });
    setEditingId(event._id);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', sport: '', startDate: '', endDate: '',
      registrationDeadline: '', venue: '', maxParticipants: 10,
      eventType: 'solo', minTeamSize: 2, maxTeamSize: 5,
      registrationFormUrl: '', status: 'upcoming', image: null
    });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Date Validations
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      return alert("End date must be after start date");
    }

    // NEW: Team Size Validations
    if (formData.eventType === 'team') {
      if (Number(formData.minTeamSize) > Number(formData.maxTeamSize)) {
        return alert("Minimum team size cannot be greater than maximum team size.");
      }
      if (Number(formData.minTeamSize) < 2) {
        return alert("A team must have at least 2 members.");
      }
    }

    const submitData = new FormData();
    
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'image' && value) {
        submitData.append('image', value as File);
      } else if (value !== null && value !== undefined && key !== 'image') {
        // Prevent appending team sizes if it's a solo event to keep DB clean
        if (formData.eventType === 'solo' && (key === 'minTeamSize' || key === 'maxTeamSize')) {
          return; 
        }
        submitData.append(key, String(value)); 
      }
    });

    try {
      if (editingId) {
        await eventService.update(editingId, submitData);
      } else {
        await eventService.create(submitData);
      }
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.message || "Error saving event");
    }
  };

  const handleDelete = async (id: string, status: string) => {
    if (status === 'ongoing') return alert("Cannot delete an ongoing event.");
    if (window.confirm('Are you sure you want to permanently delete this event?')) {
      try {
        await eventService.delete(id);
        fetchData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  // --- Filter Logic ---
  const filteredEvents = events.filter(ev => {
    const matchesStatus = filterStatus === 'all' || ev.status === filterStatus;
    const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ev.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) return <DashboardLayout><div className="p-10 text-center text-gray-500 font-medium">Loading Events...</div></DashboardLayout>;

  return (
      <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Event Management</h1>
            <p className="text-gray-500 text-sm mt-1">Create and track university sports tournaments.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm"
          >
            + Add New Event
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <input 
            type="text" 
            placeholder="Search by title or venue..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-w-[180px]"
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* EVENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
              No events match your search criteria.
            </div>
          ) : (
            filteredEvents.map(event => {
              const confirmedCount = event.confirmedCount || 0;
              const progressPct = event.maxParticipants > 0 ? Math.min(100, (confirmedCount / event.maxParticipants) * 100) : 0;
              
              let statusBadgeColor = 'bg-gray-100 text-gray-800';
              if (event.status === 'upcoming') statusBadgeColor = 'bg-blue-100 text-blue-800';
              if (event.status === 'ongoing') statusBadgeColor = 'bg-green-100 text-green-800';
              if (event.status === 'cancelled') statusBadgeColor = 'bg-red-100 text-red-800';

              return (
                <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition">
                  
                  {/* Banner Image */}
                  <div className="h-40 bg-gray-100 relative border-b border-gray-100">
                    {event.imageUrl ? (
                      <img src={`http://localhost:5000${event.imageUrl}`} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm">No Banner</div>
                    )}
                    <span className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-bold uppercase tracking-wide rounded shadow-sm ${statusBadgeColor}`}>
                      {event.status}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight line-clamp-1">{event.title}</h3>
                    <p className="text-sm font-semibold text-blue-600 mb-4">{event.sport?.name || 'General Event'}</p>
                    
                    <div className="text-sm text-gray-600 space-y-2 mb-4">
                      <p>📅 {new Date(event.startDate).toLocaleDateString()} &mdash; {new Date(event.endDate).toLocaleDateString()}</p>
                      <p className="truncate">📍 {event.venue}</p>
                      <p className="text-xs font-semibold text-red-500">⏳ Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}</p>
                    </div>

                    {/* NEW: Event Type Indicator */}
                    <div className="mb-4">
                      <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded">
                        {event.eventType === 'team' 
                          ? `Team Event (${event.minTeamSize}-${event.maxTeamSize} members)` 
                          : 'Solo Event'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-auto mb-5 space-y-2">
                      <div className="flex justify-between text-xs font-medium text-gray-700">
                        {/* Wording changes slightly based on team/solo */}
                        <span>{event.eventType === 'team' ? 'Teams Registered' : 'Registrations'}</span>
                        <span>{confirmedCount} / {event.maxParticipants}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${progressPct >= 100 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${progressPct}%` }}></div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">
                            View {confirmedCount} Attendees ➔ 
                        </div>
                        <div className="flex space-x-3">
                            <button onClick={() => openEditModal(event)} className="text-sm font-medium text-gray-500 hover:text-blue-600 transition">Edit</button>
                            <button onClick={() => handleDelete(event._id, event.status)} disabled={event.status === 'ongoing'} className="text-sm font-medium text-gray-500 hover:text-red-600 disabled:opacity-50 transition">Delete</button>
                        </div>
                    </div>

                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* CREATE / EDIT MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">{editingId ? 'Edit Event' : 'Create New Event'}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Event Title *</label>
                    <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                    <textarea name="description" required rows={3} value={formData.description} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Sport *</label>
                    <select name="sport" required value={formData.sport} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="" disabled>Select a Sport</option>
                      {sports.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Venue *</label>
                    <input type="text" name="venue" required value={formData.venue} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  {/* NEW: Event Type Selection */}
                  <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Registration Type *</label>
                    <div className="flex gap-4 mb-4">
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" name="eventType" value="solo" checked={formData.eventType === 'solo'} onChange={handleInputChange} className="mr-2 text-blue-600" />
                        Solo / Individual
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" name="eventType" value="team" checked={formData.eventType === 'team'} onChange={handleInputChange} className="mr-2 text-blue-600" />
                        Team Event
                      </label>
                    </div>

                    {/* Conditional Team Size Inputs */}
                    {formData.eventType === 'team' && (
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Min Team Members</label>
                          <input type="number" name="minTeamSize" min="2" value={formData.minTeamSize} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Max Team Members</label>
                          <input type="number" name="maxTeamSize" min={formData.minTeamSize} value={formData.maxTeamSize} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date *</label>
                    <input type="date" name="startDate" required value={formData.startDate} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">End Date *</label>
                    <input type="date" name="endDate" required value={formData.endDate} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Registration Deadline *</label>
                    <input type="date" name="registrationDeadline" required value={formData.registrationDeadline} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Max Capacity ({formData.eventType === 'team' ? 'Total Teams' : 'Total Participants'}) *
                    </label>
                    <input type="number" name="maxParticipants" required min="1" value={formData.maxParticipants} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  {editingId && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Event Status</label>
                      <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Banner Image (Optional)</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 outline-none" />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8 border-t border-gray-100 pt-5">
                  <button type="button" onClick={resetForm} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                    {editingId ? 'Save Changes' : 'Create Event'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
  );
}