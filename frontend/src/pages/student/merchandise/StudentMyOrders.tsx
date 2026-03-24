import React, { useState, useEffect } from 'react';
import { merchandiseService } from '../../../services/merchandiseService';
import { DashboardLayout } from "@/components/DashboardLayout";

// TypeScript Interfaces
interface PopulatedMerch {
  _id: string;
  itemName: string;
  image: string;
  category: string;
}

interface Order {
  _id: string;
  merchandise: PopulatedMerch | null; // Nullable in case the admin deletes the item later
  selectedSize: string;
  quantity: number;
  totalPrice: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
}

export default function StudentMyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const response = await merchandiseService.getMyOrders();
      setOrders(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch your orders');
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

  if (loading) return <DashboardLayout><div className="p-8 text-center text-gray-500">Loading your orders...</div></DashboardLayout>;
  if (error) return <DashboardLayout><div className="p-8 text-center text-red-500">Error: {error}</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-8 w-full max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Merchandise Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-500">You haven't purchased or claimed any team kits yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    
                    {/* Item Details (Image + Name + Size) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded border flex items-center justify-center overflow-hidden">
                          {order.merchandise?.image && order.merchandise.image !== 'no-photo.jpg' ? (
                            <img src={`http://localhost:5001${order.merchandise.image}`} alt={order.merchandise.itemName} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-gray-400 text-xs">No Img</span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">
                            {order.merchandise?.itemName || 'Item Unavailable'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex gap-2">
                            <span className="bg-gray-100 px-2 py-0.5 rounded border">Size: {order.selectedSize}</span>
                            <span className="bg-gray-100 px-2 py-0.5 rounded border">Qty: {order.quantity}</span>
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
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}