import React, { useState, useEffect } from 'react';
import { merchandiseService } from '../../../services/merchandiseService';
import { DashboardLayout } from "@/components/DashboardLayout";

// TypeScript Interfaces
interface Variant {
  size: string;
  stockQuantity: number;
}

interface MerchandiseItem {
  _id: string;
  itemName: string;
  sport?: { _id: string; name: string };
  category: string;
  price: number;
  image: string;
  variants: Variant[];
}

export default function StudentMerchandise() {
  const [merchandise, setMerchandise] = useState<MerchandiseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Order Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MerchandiseItem | null>(null);
  const [orderData, setOrderData] = useState({
    selectedSize: '',
    quantity: 1
  });

  useEffect(() => {
    fetchMerchandise();
  }, []);

  const fetchMerchandise = async () => {
    try {
      setLoading(true);
      const response = await merchandiseService.getAll();
      setMerchandise(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch shop items');
    } finally {
      setLoading(false);
    }
  };

  // --- Helpers ---
  const calculateTotalStock = (variants: Variant[]) => {
    if (!variants) return 0;
    return variants.reduce((total, v) => total + v.stockQuantity, 0);
  };

  const getStockForSize = (item: MerchandiseItem, size: string) => {
    const variant = item.variants.find(v => v.size === size);
    return variant ? variant.stockQuantity : 0;
  };

  // --- Handlers ---
  const openOrderModal = (item: MerchandiseItem) => {
    setSelectedItem(item);
    
    // Auto-select the first size that is actually in stock
    const firstAvailableVariant = item.variants.find(v => v.stockQuantity > 0);
    
    setOrderData({
      selectedSize: firstAvailableVariant ? firstAvailableVariant.size : '',
      quantity: 1
    });
    
    setIsOrderModalOpen(true);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (!orderData.selectedSize) return alert("Please select a size.");

    try {
      await merchandiseService.createOrder(selectedItem._id, {
        quantity: orderData.quantity,
        selectedSize: orderData.selectedSize
      });
      
      alert("Order placed successfully!");
      
      setIsOrderModalOpen(false);
      setSelectedItem(null);
      fetchMerchandise(); // Refresh stock numbers
      
    } catch (err: any) {
      alert(err.message || 'Failed to place order.');
    }
  };

  if (loading) return <DashboardLayout><div className="p-8 text-center text-gray-500">Loading shop...</div></DashboardLayout>;
  if (error) return <DashboardLayout><div className="p-8 text-center text-red-500">Error: {error}</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-8 w-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">UniSports Shop</h1>
          <p className="text-gray-500 text-sm">Get your official gear and team kits.</p>
        </div>

        {/* SHOP GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {merchandise.map((item) => {
            const totalStock = calculateTotalStock(item.variants);
            const isOutOfStock = totalStock === 0;

            return (
              <div key={item._id} className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition">
                {/* Image Section */}
                <div className="h-56 bg-gray-100 relative">
                  {item.image && item.image !== 'no-photo.jpg' ? (
                    <img src={`http://localhost:5000${item.image}`} alt={item.itemName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  
                  {/* Price/Free Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-3 py-1 text-xs font-bold rounded shadow-sm ${
                      item.price === 0 ? 'bg-green-500 text-white' : 'bg-white text-gray-800 border'
                    }`}>
                      {item.price === 0 ? 'Free Issue' : `Rs. ${item.price}`}
                    </span>
                  </div>

                  {/* Stock Badge */}
                  {isOutOfStock && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 text-xs font-bold rounded shadow-sm bg-red-500 text-white">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.itemName}</h3>
                  </div>
                  <p className="text-xs text-blue-600 font-medium mb-3">{item.category} • {item.sport?.name || 'All Sports'}</p>
                  
                  <div className="mt-auto">
                    <button 
                      onClick={() => openOrderModal(item)}
                      disabled={isOutOfStock}
                      className={`w-full py-2 rounded font-semibold transition ${
                        isOutOfStock 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                      }`}
                    >
                      {isOutOfStock ? 'Sold Out' : (item.price === 0 ? 'Claim Free Kit' : 'Purchase')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ORDER MODAL */}
        {isOrderModalOpen && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-0 w-full max-w-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Side: Image (Hidden on small mobile) */}
              <div className="w-full md:w-1/2 bg-gray-100 hidden md:block relative">
                {selectedItem.image && selectedItem.image !== 'no-photo.jpg' ? (
                  <img src={`http://localhost:5000${selectedItem.image}`} alt={selectedItem.itemName} className="w-full h-full object-cover absolute inset-0" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 absolute inset-0">No Image</div>
                )}
              </div>

              {/* Right Side: Order Details */}
              <div className="w-full md:w-1/2 p-6 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{selectedItem.itemName}</h2>
                  <button onClick={() => setIsOrderModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
                </div>
                
                <p className="text-sm text-gray-500 mb-4">{selectedItem.category} • {selectedItem.sport?.name || 'All Sports'}</p>
                
                <div className="mb-6">
                  <span className={`px-3 py-1 text-sm font-bold rounded ${selectedItem.price === 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {selectedItem.price === 0 ? 'Free Issue' : `Rs. ${selectedItem.price}`}
                  </span>
                </div>

                <form onSubmit={handleOrderSubmit} className="flex-grow flex flex-col">
                  
                  {/* Size Selector */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Size</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.variants.map((variant) => {
                        const isAvailable = variant.stockQuantity > 0;
                        const isSelected = orderData.selectedSize === variant.size;
                        
                        return (
                          <button
                            key={variant.size}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => setOrderData({ ...orderData, selectedSize: variant.size, quantity: 1 })}
                            className={`w-12 h-10 rounded border font-medium flex items-center justify-center transition-colors
                              ${isSelected ? 'bg-blue-600 text-white border-blue-600' : ''}
                              ${!isSelected && isAvailable ? 'bg-white text-gray-700 border-gray-300 hover:border-blue-500' : ''}
                              ${!isAvailable ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed line-through' : ''}
                            `}
                          >
                            {variant.size}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <div className="flex items-center">
                      <button 
                        type="button"
                        onClick={() => setOrderData({ ...orderData, quantity: Math.max(1, orderData.quantity - 1) })}
                        className="w-10 h-10 border rounded-l flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600"
                      >
                        -
                      </button>
                      <div className="w-12 h-10 border-t border-b flex items-center justify-center font-medium">
                        {orderData.quantity}
                      </div>
                      <button 
                        type="button"
                        disabled={!orderData.selectedSize || orderData.quantity >= getStockForSize(selectedItem, orderData.selectedSize)}
                        onClick={() => setOrderData({ ...orderData, quantity: orderData.quantity + 1 })}
                        className="w-10 h-10 border rounded-r flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                      
                      {orderData.selectedSize && (
                        <span className="ml-3 text-xs text-gray-500">
                          {getStockForSize(selectedItem, orderData.selectedSize)} available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Total Price & Submit */}
                  <div className="mt-auto border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600">Total:</span>
                      <span className="text-xl font-bold text-gray-900">
                        {selectedItem.price === 0 ? 'Free' : `Rs. ${selectedItem.price * orderData.quantity}`}
                      </span>
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={!orderData.selectedSize}
                      className="w-full py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {selectedItem.price === 0 ? 'Confirm Free Claim' : 'Place Order'}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}