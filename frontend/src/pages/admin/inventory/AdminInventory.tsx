import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../../services/inventoryService';
import { DashboardLayout } from "@/components/DashboardLayout";

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    itemName: '',
    sport: '', 
    location: '', 
    totalQuantity: 0,
    image: null
  });

  // Fetch data on component mount
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, image: e.target.files[0] as any });
    }
  };

  // Open Modal for Editing
  const openEditModal = (item: any) => {
    setFormData({
      itemName: item.itemName,
      sport: item.sport?._id || '', 
      location: item.location?._id || '', 
      totalQuantity: item.totalQuantity,
      image: null 
    });
    setEditingId(item._id);
    setIsAddModalOpen(true);
  };

  // Reset form helper
  const resetForm = () => {
    setFormData({ itemName: '', sport: '', location: '', totalQuantity: 0, image: null });
    setEditingId(null);
    setIsAddModalOpen(false);
  };

  // Submit Equipment (Handles BOTH Add and Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('itemName', formData.itemName);
      submitData.append('sport', formData.sport);
      submitData.append('location', formData.location);
      submitData.append('totalQuantity', String(formData.totalQuantity));

      if (formData.image) {
        submitData.append('image', formData.image);
      }

      if (editingId) {
        await inventoryService.update(editingId, submitData);
      } else {
        await inventoryService.create(submitData);
      }
      
      resetForm();
      fetchInventory(); 
      
    } catch (err: any) {
      alert(err.message || 'Failed to save equipment');
    }
  };

  // Delete Equipment
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryService.delete(id);
        fetchInventory(); 
      } catch (err: any) {
        alert(err.message || 'Failed to delete item');
      }
    }
  };

  if (loading) return <DashboardLayout><div className="p-8 text-center text-slate-400 mt-20 font-medium">Loading inventory...</div></DashboardLayout>;
  if (error) return <DashboardLayout><div className="p-8 text-center text-red-500 mt-20">Error: {error}</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6 text-slate-200">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Inventory Management</h1>
            <p className="text-slate-400 text-sm mt-1">Manage sports equipment, quantities, and availability.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-lg shadow-indigo-500/20 border border-indigo-500/50"
          >
            + Add Equipment
          </button>
        </div>

        {/* INVENTORY TABLE */}
        <div className="bg-[#1e1e2d] rounded-xl shadow-lg border border-slate-700/50 overflow-hidden w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700/50">
            <thead className="bg-[#151521]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Item</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Sport / Location</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Available</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 bg-[#1e1e2d]">
              {inventory.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No equipment found.</td></tr>            
              ) : (
                inventory.map((item: any) => (
                  <tr key={item._id} className="hover:bg-[#151521]/50 transition duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 h-12 w-12 bg-[#151521] border border-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.image && item.image !== 'no-photo.jpg' ? (
                            <img src={`http://localhost:5001${item.image}`} alt={item.itemName} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">No Img</span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{item.itemName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-indigo-400 font-medium mb-0.5">{item.sport?.name || 'N/A'}</div>
                      <div className="text-xs text-slate-500 font-medium">{item.location?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-white">
                      {item.totalQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold">
                      <span className={`${item.availableQuantity === 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {item.availableQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 inline-flex text-xs font-bold uppercase tracking-wide rounded-full border ${
                        item.status === 'Available' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => openEditModal(item)} 
                          className="text-indigo-400 hover:text-indigo-300 transition"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(item._id)} 
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ADD/EDIT EQUIPMENT MODAL */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1e1e2d] rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-slate-700">
              <h2 className="text-2xl font-bold mb-6 text-white border-b border-slate-700/50 pb-4">
                {editingId ? 'Edit Equipment' : 'Add New Equipment'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Item Name</label>
                  <input 
                    type="text" name="itemName" required
                    value={formData.itemName} onChange={handleInputChange}
                    className="w-full bg-[#151521] border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Cricket Bat"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Sport ID</label>
                  <input 
                    type="text" name="sport" required
                    value={formData.sport} onChange={handleInputChange}
                    className="w-full bg-[#151521] border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Paste Sport Object ID here"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Location ID</label>
                  <input 
                    type="text" name="location" required
                    value={formData.location} onChange={handleInputChange}
                    className="w-full bg-[#151521] border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Paste Location Object ID here"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Total Quantity</label>
                  <input 
                    type="number" name="totalQuantity" min="1" required
                    value={formData.totalQuantity} onChange={handleInputChange}
                    className="w-full bg-[#151521] border border-slate-600 text-white rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    {editingId ? 'Update Image (Leave blank to keep current)' : 'Equipment Image'}
                  </label>
                  <input 
                    type="file" accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 hover:file:text-indigo-300 outline-none transition file:cursor-pointer"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700/50">
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="px-5 py-2.5 border border-slate-600 rounded-lg text-slate-300 font-medium hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20"
                  >
                    {editingId ? 'Save Changes' : 'Save Equipment'}
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