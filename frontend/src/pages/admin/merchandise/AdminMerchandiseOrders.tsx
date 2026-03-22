import React, { useState, useEffect } from 'react';
import { merchandiseService } from '../../../services/merchandiseService';
import { DashboardLayout } from "@/components/DashboardLayout";

// TypeScript Interfaces
interface PopulatedStudent {
  _id: string;
  name?: string;
  email: string;
}

interface PopulatedMerch {
  _id: string;
  itemName: string;
  image: string;
  category: string;
  price: number;
}

interface Order {
  _id: string;
  student: PopulatedStudent;
  merchandise: PopulatedMerch | null;
  selectedSize: string;
  quantity: number;
  totalPrice: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
}

export default function AdminMerchandiseOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateData, setUpdateData] = useState({
    paymentStatus: '',
    fulfillmentStatus: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await merchandiseService.getAllOrders();
      setOrders(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // --- Badge Styling Helpers ---
  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Paid': 'bg-green-100 text-green-800',
      'Free Issue': 'bg-blue-100 text-blue-800',
    };
    return `px-2 py-1 text-xs font-bold rounded shadow-sm ${styles[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getFulfillmentBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Processing': 'bg-orange-100 text-orange-800 border-orange-200',
      'Ready for Pickup': 'bg-blue-100 text-blue-800 border-blue-200',
      'Delivered/Handed Over': 'bg-green-100 text-green-800 border-green-200',
    };
    return `px-3 py-1 text-xs font-semibold rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`;
  };

  // --- Handlers ---
  const openUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    setUpdateData({
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus
    });
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await merchandiseService.updateOrderStatus(selectedOrder._id, {
        paymentStatus: updateData.paymentStatus,
        fulfillmentStatus: updateData.fulfillmentStatus
      });

      alert("Order status updated successfully!");
      setIsModalOpen(false);
      fetchOrders(); // Refresh table
    } catch (err: any) {
      alert(err.message || 'Failed to update order status.');
    }
  };

  if (loading) return <DashboardLayout><div className="p-8 text-center text-gray-500">Loading orders...</div></DashboardLayout>;
  if (error) return <DashboardLayout><div className="p-8 text-center text-red-500">Error: {error}</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-8 w-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Student Merchandise Orders</h1>
          <div className="bg-white px-4 py-2 rounded shadow-sm border border-gray-200 text-sm font-medium text-gray-600">
            Total Orders: {orders.length}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-500">Students have not placed any merchandise orders yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date / Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Due</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fulfillment</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    
                    {/* Date & Student */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {order.student?.name || order.student?.email || 'Unknown Student'}
                      </div>
                    </td>
                    
                    {/* Item Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded border flex items-center justify-center overflow-hidden">
                          {order.merchandise?.image && order.merchandise.image !== 'no-photo.jpg' ? (
                            <img src={`http://localhost:5000${order.merchandise.image}`} alt={order.merchandise.itemName} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-gray-400 text-xs">No Img</span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">
                            {order.merchandise?.itemName || 'Item Deleted'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Size: <span className="font-semibold">{order.selectedSize}</span> | Qty: <span className="font-semibold">{order.quantity}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Total Price */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {order.totalPrice === 0 ? 'Free' : `Rs. ${order.totalPrice}`}
                      </div>
                    </td>

                    {/* Payment Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={getPaymentBadge(order.paymentStatus)}>
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* Fulfillment Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={getFulfillmentBadge(order.fulfillmentStatus)}>
                        {order.fulfillmentStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => openUpdateModal(order)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded border border-blue-200 hover:bg-blue-100 transition"
                      >
                        Process Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PROCESS ORDER MODAL */}
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-4 border-b pb-2">Process Student Order</h2>
              
              <div className="mb-6 bg-gray-50 p-4 rounded border text-sm flex justify-between items-center">
                <div>
                  <p className="text-gray-500 mb-1">Total Due</p>
                  <p className="text-xl font-bold text-gray-900">
                    {selectedOrder.totalPrice === 0 ? 'Free Issue' : `Rs. ${selectedOrder.totalPrice}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 mb-1">Student</p>
                  <p className="font-medium text-gray-900">{selectedOrder.student?.name || selectedOrder.student?.email}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateSubmit}>
                
                {/* Payment Status (Disabled if Free Issue) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <select 
                    value={updateData.paymentStatus}
                    onChange={(e) => setUpdateData({...updateData, paymentStatus: e.target.value})}
                    disabled={selectedOrder.totalPrice === 0}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="Pending">Pending (Not Paid)</option>
                    <option value="Paid">Paid (Cash/Transfer Received)</option>
                    <option value="Free Issue">Free Issue</option>
                  </select>
                </div>

                {/* Fulfillment Status */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fulfillment Status</label>
                  <select 
                    value={updateData.fulfillmentStatus}
                    onChange={(e) => setUpdateData({...updateData, fulfillmentStatus: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                  >
                    <option value="Processing">Processing (Preparing Item)</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Delivered/Handed Over">Delivered / Handed Over</option>
                  </select>
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