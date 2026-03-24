import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../../services/inventoryService';
import { equipmentRequestService } from '../../../services/equipmentRequestService';
// Note: Assuming you have a student-facing layout. If not, you can use DashboardLayout or a standard div container.
import { DashboardLayout } from "@/components/DashboardLayout"; 

// Interface for items in the borrowing "cart"
interface CartItem {
  equipmentId: string;
  itemName: string;
  quantity: number;
  maxAvailable: number;
}

export default function StudentInventory() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Borrowing Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  
  // Checkout Form State
  const [checkoutData, setCheckoutData] = useState({
    expectedReturnDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getAll();
      setInventory(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  // --- Cart Handlers ---
  const addToCart = (item: any) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.equipmentId === item._id);
      
      if (existingItem) {
        // Prevent adding more than what's available
        if (existingItem.quantity >= item.availableQuantity) return prevCart;
        
        return prevCart.map(cartItem => 
          cartItem.equipmentId === item._id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { 
          equipmentId: item._id, 
          itemName: item.itemName, 
          quantity: 1, 
          maxAvailable: item.availableQuantity 
        }];
      }
    });
  };

  const updateCartQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prevCart => prevCart.map(item => 
      item.equipmentId === id 
        ? { ...item, quantity: Math.min(newQuantity, item.maxAvailable) } 
        : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.equipmentId !== id));
  };

  // --- Checkout Handlers ---
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Your cart is empty!");

    try {
      // Format data to match backend Zod schema
      const payload = {
        items: cart.map(item => ({
          equipment: item.equipmentId,
          quantity: item.quantity
        })),
        expectedReturnDate: checkoutData.expectedReturnDate,
        notes: checkoutData.notes
      };

      await equipmentRequestService.create(payload);
      
      alert("Borrow request submitted successfully! An admin or coach will review it.");
      
      // Cleanup
      setCart([]);
      setIsCheckoutModalOpen(false);
      setCheckoutData({ expectedReturnDate: '', notes: '' });
      fetchInventory(); // Refresh stock numbers
      
    } catch (err: any) {
      alert(err.message || 'Failed to submit borrow request.');
    }
  };

  // Get tomorrow's date for the min attribute on the date picker
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading) return <DashboardLayout><div className="p-8 text-center text-gray-500">Loading equipment...</div></DashboardLayout>;
  if (error) return <DashboardLayout><div className="p-8 text-center text-red-500">Error: {error}</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-8 w-full relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Borrow Sports Equipment</h1>
          
          {/* Cart Button */}
          <button 
            onClick={() => setIsCheckoutModalOpen(true)}
            disabled={cart.length === 0}
            className={`relative px-4 py-2 rounded shadow transition ${
              cart.length > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Review Request
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {/* EQUIPMENT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {inventory.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden flex flex-col">
              {/* Image Section */}
              <div className="h-48 bg-gray-100 relative">
                {item.image && item.image !== 'no-photo.jpg' ? (
                  <img src={`http://localhost:5001${item.image}`} alt={item.itemName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-bold rounded shadow-sm ${
                    item.availableQuantity > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {item.availableQuantity > 0 ? `${item.availableQuantity} Available` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Details Section */}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.itemName}</h3>
                <p className="text-sm text-gray-500 mb-4">{item.sport?.name || 'General Equipment'}</p>
                
                <div className="mt-auto">
                  <button 
                    onClick={() => addToCart(item)}
                    disabled={item.availableQuantity === 0}
                    className={`w-full py-2 rounded font-semibold transition ${
                      item.availableQuantity === 0 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600'
                    }`}
                  >
                    {item.availableQuantity === 0 ? 'Unavailable' : 'Add to Request'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CHECKOUT MODAL */}
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col">
              <h2 className="text-xl font-bold mb-4 border-b pb-2">Review Borrow Request</h2>
              
              {/* Selected Items List */}
              <div className="overflow-y-auto mb-6 flex-grow">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Selected Items</h3>
                {cart.map(item => (
                  <div key={item.equipmentId} className="flex justify-between items-center bg-gray-50 p-3 rounded mb-2 border">
                    <div className="font-medium text-gray-800">{item.itemName}</div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateCartQuantity(item.equipmentId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center bg-white border rounded hover:bg-gray-100">-</button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQuantity(item.equipmentId, item.quantity + 1)} 
                        disabled={item.quantity >= item.maxAvailable}
                        className="w-8 h-8 flex items-center justify-center bg-white border rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        +
                      </button>
                      <button onClick={() => removeFromCart(item.equipmentId)} className="ml-2 text-red-500 hover:text-red-700 text-sm">Remove</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Request Details Form */}
              <form onSubmit={handleCheckoutSubmit} className="border-t pt-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return Date *</label>
                  <input 
                    type="date" 
                    required 
                    min={getTomorrowDate()} // Prevents selecting past dates or today
                    value={checkoutData.expectedReturnDate} 
                    onChange={e => setCheckoutData({...checkoutData, expectedReturnDate: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">When do you plan to return the equipment?</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Purpose (Optional)</label>
                  <textarea 
                    rows={2}
                    value={checkoutData.notes} 
                    onChange={e => setCheckoutData({...checkoutData, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="e.g., Needed for Saturday practice match."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setIsCheckoutModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Keep Browsing
                  </button>
                  <button 
                    type="submit"
                    disabled={cart.length === 0 || !checkoutData.expectedReturnDate}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Submit Request
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