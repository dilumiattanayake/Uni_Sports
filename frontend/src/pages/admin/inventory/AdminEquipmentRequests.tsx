import React, { useState, useEffect } from 'react';
import { equipmentRequestService } from '../../../services/equipmentRequestService';
import { DashboardLayout } from "@/components/DashboardLayout";

// Define TypeScript interfaces for the populated data
interface RequestedItem {
  _id: string;
  equipment: {
    _id: string;
    itemName: string;
  };
  quantity: number;
}

interface StudentInfo {
  _id: string;
  name?: string; 
  email: string;
}

interface BorrowRequest {
  _id: string;
  student: StudentInfo;
  items: RequestedItem[];
  expectedReturnDate: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export default function AdminEquipmentRequests() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Update Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);
  const [updateData, setUpdateData] = useState({
    status: 'Pending',
    notes: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await equipmentRequestService.getAll();
      setRequests(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch equipment requests');
    } finally {
      setLoading(false);
    }
  };

  // --- Helper to style status badges (Dark Theme adapted) ---
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'Approved': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Borrowed': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Returned': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Overdue': 'bg-red-500/20 text-red-300 border-red-500/30',
      'Rejected': 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    };
    
    return `px-3 py-1 text-xs font-semibold rounded-full border tracking-wide uppercase ${styles[status] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'}`;
  };

  // --- Handlers ---
  const openUpdateModal = (request: BorrowRequest) => {
    setSelectedRequest(request);
    setUpdateData({
      status: request.status,
      notes: '' // Leave blank so admin can add fresh notes
    });
    setIsModalOpen(true);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      await equipmentRequestService.updateStatus(selectedRequest._id, {
        status: updateData.status,
        notes: updateData.notes
      });

      alert(`Request status updated to ${updateData.status}`);
      setIsModalOpen(false);
      fetchRequests(); 
    } catch (err: any) {
      alert(err.message || 'Failed to update request status.');
    }
  };

  if (loading) return <DashboardLayout><div className="p-8 text-center text-slate-400 mt-20 font-medium">Loading requests...</div></DashboardLayout>;
  if (error) return <DashboardLayout><div className="p-8 text-center text-red-500 mt-20">{error}</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 text-slate-200">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Equipment Borrowing Requests</h1>
            <p className="text-slate-400 text-sm mt-1">Manage and track student equipment requests.</p>
          </div>
          
          <div className="bg-[#1e1e2d] px-4 py-2.5 rounded-lg shadow-lg border border-slate-700/50 text-sm font-medium text-slate-300 flex items-center gap-2">
            <span className="text-indigo-400">Total Requests:</span> 
            <span className="text-white font-bold">{requests.length}</span>
          </div>
        </div>

        {/* Requests Table Area */}
        {requests.length === 0 ? (
          <div className="bg-[#1e1e2d] rounded-xl shadow-lg p-12 text-center border border-slate-700/50 flex flex-col items-center">
             <span className="text-5xl mb-4 opacity-40">📦</span>
            <h3 className="text-xl font-bold text-white mb-2">No Requests Found</h3>
            <p className="text-slate-400 max-w-md">There are currently no equipment borrowing requests pending in the system.</p>
          </div>
        ) : (
          <div className="bg-[#1e1e2d] rounded-xl shadow-lg border border-slate-700/50 overflow-hidden w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700/50">
              <thead className="bg-[#151521]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date / Student</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Requested Items</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Expected Return</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 bg-[#1e1e2d]">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-[#151521]/50 transition duration-200">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-white mb-1">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-indigo-400 font-medium">
                        {req.student?.name || req.student?.email || 'Unknown Student'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-5">
                      <ul className="space-y-1.5">
                        {req.items.map((item, idx) => (
                          <li key={idx} className="text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            <span className="font-semibold text-slate-200">{item.equipment?.itemName || 'Unknown Item'}</span> 
                            <span className="text-slate-500 font-medium bg-[#151521] px-2 py-0.5 rounded border border-slate-700/50">x{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                      {req.notes && (
                        <div className="mt-3 bg-[#151521] p-3 rounded-lg border border-slate-700/50">
                          <p className="text-xs text-slate-300 leading-relaxed">
                            <span className="font-bold text-indigo-400 uppercase tracking-wider mr-2">Note:</span> 
                            {req.notes}
                          </p>
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-300">
                      {new Date(req.expectedReturnDate).toLocaleDateString()}
                    </td>
                    
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <span className={getStatusBadge(req.status)}>
                        {req.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <button 
                        onClick={() => openUpdateModal(req)}
                        className="text-xs font-bold text-indigo-400 hover:text-white bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/20 hover:bg-indigo-600 hover:border-indigo-500 transition shadow-sm"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* STATUS UPDATE MODAL */}
        {isModalOpen && selectedRequest && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e1e2d] rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-slate-700">
              <h2 className="text-xl font-bold mb-4 text-white border-b border-slate-700/50 pb-4">Update Request Status</h2>
              
              <div className="mb-6 bg-[#151521] p-4 rounded-lg border border-slate-700/50 text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Student</span>
                  <span className="font-semibold text-white">{selectedRequest.student?.name || selectedRequest.student?.email}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Current Status</span>
                  <span className={getStatusBadge(selectedRequest.status)}>{selectedRequest.status}</span>
                </div>
              </div>

              <form onSubmit={handleStatusSubmit}>
                <div className="mb-5">
                  <label className="block text-sm font-bold text-slate-300 mb-2">New Status</label>
                  <select 
                    value={updateData.status}
                    onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                    className="w-full bg-[#151521] border border-slate-600 text-white rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Borrowed">Borrowed (Handed to student)</option>
                    <option value="Returned">Returned (Safely received)</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-bold text-slate-300 mb-2">Admin Notes (Optional)</label>
                  <textarea 
                    rows={3}
                    value={updateData.notes}
                    onChange={(e) => setUpdateData({...updateData, notes: e.target.value})}
                    className="w-full bg-[#151521] border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="E.g., Approved, please collect from the sports room tomorrow at 10 AM."
                  />
                  <p className="text-xs text-slate-500 mt-2">This note will be visible if you choose to display it on the student's end.</p>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700/50">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 border border-slate-600 rounded-lg text-slate-300 font-medium hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20"
                  >
                    Save Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}