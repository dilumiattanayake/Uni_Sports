import React, { useState, useEffect } from 'react';
import { merchandiseService } from '../../../services/merchandiseService';
import { DashboardLayout } from "@/components/DashboardLayout";

interface Variant {
  size: string;
  stockQuantity: number;
}

export default function AdminMerchandise() {
  const [merchandise, setMerchandise] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // NEW: Track if we are editing
  
  // Form State
  const [formData, setFormData] = useState({
    itemName: '',
    sport: '', 
    category: 'Apparel',
    price: 0,
    image: null as File | null
  });

  const [variants, setVariants] = useState<Variant[]>([{ size: 'M', stockQuantity: 0 }]);
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'N/A'];

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
      setError(err.message || 'Failed to fetch merchandise');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleVariantChange = (index: number, field: keyof Variant, value: string | number) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setVariants(updatedVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { size: 'L', stockQuantity: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // NEW: Open Modal for Editing an existing item
  const openEditModal = (item: any) => {
    setFormData({
      itemName: item.itemName,
      sport: item.sport?._id || '', // Grab the ID, not the populated object
      category: item.category,
      price: item.price,
      image: null // Reset image so they don't overwrite it unless they upload a new one
    });
    
    // Map existing variants into state
    setVariants(item.variants.map((v: any) => ({ size: v.size, stockQuantity: v.stockQuantity })));
    
    setEditingId(item._id);
    setIsAddModalOpen(true);
  };

  // Reset form helper
  const resetForm = () => {
    setFormData({ itemName: '', sport: '', category: 'Apparel', price: 0, image: null });
    setVariants([{ size: 'M', stockQuantity: 0 }]);
    setEditingId(null);
    setIsAddModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('itemName', formData.itemName);
      submitData.append('sport', formData.sport);
      submitData.append('category', formData.category);
      submitData.append('price', String(formData.price));
      submitData.append('variants', JSON.stringify(variants));
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      // Check if updating or creating
      if (editingId) {
        await merchandiseService.update(editingId, submitData);
      } else {
        await merchandiseService.create(submitData);
      }
      
      resetForm();
      fetchMerchandise();
      
    } catch (err: any) {
      alert(err.message || 'Failed to save merchandise.');
    }
  };

  // Delete Merchandise
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await merchandiseService.delete(id); 
        fetchMerchandise(); // Instantly refreshes the table after deleting
      } catch (err: any) {
        alert(err.message || 'Failed to delete item');
      }
    }
  };

  const calculateTotalStock = (itemVariants: Variant[]) => {
    return itemVariants.reduce((total, v) => total + v.stockQuantity, 0);
  };

  if (loading) return <DashboardLayout><div className="p-8 text-center text-gray-500">Loading shop data...</div></DashboardLayout>;
  if (error) return <DashboardLayout><div className="p-8 text-center text-red-500">Error: {error}</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-8 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Merchandise Shop Management</h1>
          <button onClick={() => { resetForm(); setIsAddModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">
            + Add Merchandise
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (LKR)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock by Size</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sold</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {merchandise.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No merchandise found.</td></tr>
              ) : (
                merchandise.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                          {item.image && item.image !== 'no-photo.jpg' ? (
                            <img src={`http://localhost:5001${item.image}`} alt={item.itemName} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-gray-400 text-xs">No Img</span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                          <div className="text-xs text-gray-500">{item.sport?.name || 'Any Sport'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.price === 0 ? <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">Free Issue</span> : `Rs. ${item.price}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        {item.variants.map((v: Variant, idx: number) => (
                          <span key={idx} className={`px-2 py-1 text-xs rounded border ${v.stockQuantity === 0 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                            {v.size}: {v.stockQuantity}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Total: {calculateTotalStock(item.variants)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {item.soldOrIssuedQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* NEW: Bind Edit Button */}
                      <button onClick={() => openEditModal(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                      <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
              {/* Dynamic Title */}
              <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Merchandise' : 'Add New Merchandise'}</h2>
              <form onSubmit={handleSubmit}>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input type="text" name="itemName" required value={formData.itemName} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sport ID</label>
                    <input type="text" name="sport" required value={formData.sport} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2">
                      <option value="Apparel">Apparel</option>
                      <option value="Team Kit">Team Kit</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Footwear">Footwear</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.)</label>
                    <input type="number" name="price" min="0" required value={formData.price} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                  </div>
                </div>

                <div className="mb-6 border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Sizes & Stock</label>
                    <button type="button" onClick={addVariant} className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-700">
                      + Add Size
                    </button>
                  </div>
                  
                  {variants.map((variant, index) => (
                    <div key={index} className="flex gap-4 mb-2 items-center">
                      <select 
                        value={variant.size} 
                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                        className="w-1/3 border border-gray-300 rounded px-3 py-2"
                      >
                        {availableSizes.map(size => <option key={size} value={size}>{size}</option>)}
                      </select>
                      <input 
                        type="number" min="0" required placeholder="Stock"
                        value={variant.stockQuantity} 
                        onChange={(e) => handleVariantChange(index, 'stockQuantity', Number(e.target.value))}
                        className="w-1/3 border border-gray-300 rounded px-3 py-2"
                      />
                      {variants.length > 1 && (
                        <button type="button" onClick={() => removeVariant(index)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingId ? 'Update Image (Leave blank to keep current)' : 'Merchandise Image'}
                  </label>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700" />
                </div>

                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    {editingId ? 'Save Changes' : 'Save Merchandise'}
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