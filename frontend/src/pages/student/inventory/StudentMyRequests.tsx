import React, { useState, useEffect } from 'react';
import { equipmentRequestService } from '../../../services/equipmentRequestService';
import { DashboardLayout } from "@/components/DashboardLayout";

// Define TypeScript interfaces for better auto-complete
interface RequestedItem {
  _id: string; // The specific ID of this item sub-document in the request
  equipment: {
    _id: string;
    itemName: string;
  };
  quantity: number;
}

interface BorrowRequest {
  _id: string;
  items: RequestedItem[];
  expectedReturnDate: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export default function StudentMyRequests() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Issue Reporting Modal State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);
  const [issueData, setIssueData] = useState({
    itemId: '', // This will hold the specific equipment ID
    damagedQuantity: 0,
    lostQuantity: 0,
    issueNote: ''
  });

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const response = await equipmentRequestService.getMyRequests();
      // Assuming your backend returns { success: true, data: [...] }
      setRequests(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch your requests');
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
    
    const defaultStyle = 'bg-gray-100 text-gray-800 border-gray-200';
    return `px-3 py-1 text-xs font-semibold rounded-full border ${styles[status] || defaultStyle}`;
  };

  // --- Issue Reporting Handlers ---
  const openIssueModal = (request: BorrowRequest) => {
    setSelectedRequest(request);
    // Auto-select the first item in the dropdown
    setIssueData({
      itemId: request.items[0]?.equipment._id || '',
      damagedQuantity: 0,
      lostQuantity: 0,
      issueNote: ''
    });
    setIsIssueModalOpen(true);
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    if (issueData.damagedQuantity === 0 && issueData.lostQuantity === 0) {
      return alert("You must report at least 1 damaged or 1 lost item.");
    }

    try {
      await equipmentRequestService.reportIssue(selectedRequest._id, {
        itemId: issueData.itemId,
        damagedQuantity: issueData.damagedQuantity,
        lostQuantity: issueData.lostQuantity,
        issueNote: issueData.issueNote
      });

      alert("Issue reported successfully to the admin team.");
      setIsIssueModalOpen(false);
      fetchMyRequests(); // Refresh the list
    } catch (err: any) {
      alert(err.message || 'Failed to report issue.');
    }
  };

  if (loading) return <DashboardLayout><div className="p-8 text-center text-gray-500">Loading your requests...</div></DashboardLayout>;
  if (error) return <DashboardLayout><div className="p-8 text-center text-red-500">Error: {error}</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-8 w-full max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Borrowing History</h1>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Requests Yet</h3>
            <p className="text-gray-500">You haven't requested to borrow any equipment.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(req.createdAt).toLocaleDateString()}
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
                        <p className="text-xs text-gray-500 mt-2 italic">Note: {req.notes}</p>
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
                      {/* Only allow issue reporting if the items are currently in their possession */}
                      {req.status === 'Borrowed' || req.status === 'Overdue' ? (
                        <button 
                          onClick={() => openIssueModal(req)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Report Issue
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT ISSUE MODAL */}
        {isIssueModalOpen && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-red-600 border-b pb-2">Report Damaged or Lost Item</h2>
              <form onSubmit={handleIssueSubmit}>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Which item has an issue?</label>
                  <select 
                    required
                    value={issueData.itemId}
                    onChange={(e) => setIssueData({...issueData, itemId: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    {selectedRequest.items.map((item) => (
                      <option key={item.equipment._id} value={item.equipment._id}>
                        {item.equipment.itemName} (Borrowed: {item.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Damaged Qty</label>
                    <input 
                      type="number" min="0" 
                      value={issueData.damagedQuantity}
                      onChange={(e) => setIssueData({...issueData, damagedQuantity: Number(e.target.value)})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lost Qty</label>
                    <input 
                      type="number" min="0" 
                      value={issueData.lostQuantity}
                      onChange={(e) => setIssueData({...issueData, lostQuantity: Number(e.target.value)})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Details of what happened *</label>
                  <textarea 
                    required minLength={3} rows={3}
                    value={issueData.issueNote}
                    onChange={(e) => setIssueData({...issueData, issueNote: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="E.g., The bat handle snapped during practice."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setIsIssueModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Submit Report
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