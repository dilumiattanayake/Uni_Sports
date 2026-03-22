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
  name?: string; // Adjust based on your actual User schema (could be firstName/lastName)
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
      // Fetch all requests (Admins see everything)
      const response = await equipmentRequestService.getAll();
      setRequests(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch equipment requests');
    } finally {
      setLoading(false);
    }
  };

  // --- Helper to style status badges ---
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Approved': 'bg-blue-100 text-blue-800 border-blue-200',
      'Borrowed': 'bg-purple-100 text-purple-800 border-purple-200',
      'Returned': 'bg-green-100 text-green-800 border-green-200',
      'Overdue': 'bg-red-100 text-red-800 border-red-200',
      'Rejected': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return `px-3 py-1 text-xs font-semibold rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`;
  };

  // --- Handlers ---
  const openUpdateModal = (request: BorrowRequest) => {
    setSelectedRequest(request);
    setUpdateData({
      status: request.status,
      notes: '' // Leave blank so admin can add fresh notes (e.g. "Items returned with scratch")
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
      fetchRequests(); // Refresh table to show new status
    } catch (err: any) {
      alert(err.message || 'Failed to update request status.');
    }
  };

  if (loading) return <DashboardLayout><div className="p-8 text-center text-gray-500">Loading requests...</div></DashboardLayout>;
  if (error) return <DashboardLayout><div className="p-8 text-center text-red-500">Error: {error}</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-8 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Equipment Borrowing Requests</h1>
          
          {/* Optional: Add filters here later (e.g., Show only Pending) */}
          <div className="bg-white px-4 py-2 rounded shadow-sm border border-gray-200 text-sm font-medium text-gray-600">
            Total Requests: {requests.length}
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Requests Found</h3>
            <p className="text-gray-500">There are no equipment borrowing requests in the system.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date / Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Return</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {/* Fallback to email if name is not available in your schema */}
                        {req.student?.name || req.student?.email || 'Unknown Student'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ul className="list-disc list-inside text-sm text-gray-700">
                        {req.items.map((item, idx) => (
                          <li key={idx}>
                            <span className="font-medium">{item.equipment?.itemName || 'Unknown Item'}</span> 
                            <span className="text-gray-500 ml-1">(x{item.quantity})</span>
                          </li>
                        ))}
                      </ul>
                      {req.notes && (
                        <p className="text-xs text-gray-500 mt-2 bg-gray-100 p-2 rounded border">
                          <span className="font-semibold">Student Note:</span> {req.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(req.expectedReturnDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={getStatusBadge(req.status)}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => openUpdateModal(req)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded border border-blue-200 hover:bg-blue-100 transition"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-4 border-b pb-2">Update Request Status</h2>
              
              <div className="mb-4 bg-gray-50 p-3 rounded border text-sm">
                <p><strong>Student:</strong> {selectedRequest.student?.name || selectedRequest.student?.email}</p>
                <p className="mt-1"><strong>Current Status:</strong> <span className={getStatusBadge(selectedRequest.status)}>{selectedRequest.status}</span></p>
              </div>

              <form onSubmit={handleStatusSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                  <select 
                    value={updateData.status}
                    onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Borrowed">Borrowed (Handed to student)</option>
                    <option value="Returned">Returned (Safely received)</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes (Optional)</label>
                  <textarea 
                    rows={3}
                    value={updateData.notes}
                    onChange={(e) => setUpdateData({...updateData, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="E.g., Approved, please collect from the sports room tomorrow at 10 AM."
                  />
                  <p className="text-xs text-gray-500 mt-1">This note will be visible if you choose to display it on the student's end.</p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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