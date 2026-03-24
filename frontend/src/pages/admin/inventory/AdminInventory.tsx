import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../../services/inventoryService';
import { DashboardLayout } from "@/components/DashboardLayout";

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // NEW: Track if we are editing
  
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
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  // NEW: Open Modal for Editing
  const openEditModal = (item) => {
    setFormData({
      itemName: item.itemName,
      sport: item.sport?._id || '', // Safely get ID if populated
      location: item.location?._id || '', // Safely get ID if populated
      totalQuantity: item.totalQuantity,
      image: null // Reset image so it doesn't upload a blank one
    });
    setEditingId(item._id);
    setIsAddModalOpen(true);
  };

  // NEW: Reset form helper
  const resetForm = () => {
    setFormData({ itemName: '', sport: '', location: '', totalQuantity: 0, image: null });
    setEditingId(null);
    setIsAddModalOpen(false);
  };

  // Submit Equipment (Handles BOTH Add and Edit)
  const handleSubmit = async (e) => {
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

      // NEW: Check if we are updating or creating
      if (editingId) {
        await inventoryService.update(editingId, submitData);
      } else {
        await inventoryService.create(submitData);
      }
      
      resetForm();
      fetchInventory(); // Refresh the table
      
    } catch (err) {
      alert(err.message || 'Failed to save equipment');
    }
  };

  // Delete Equipment
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryService.delete(id);
        fetchInventory(); // Refresh the table
      } catch (err) {
        alert(err.message || 'Failed to delete item');
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading inventory...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <DashboardLayout>
    <div className="p-8 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
        <button 
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
        >
          + Add Equipment
        </button>
      </div>

      {/* INVENTORY TABLE */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport / Location</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No equipment found.</td></tr>            
            ) : (
              inventory.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        {item.image && item.image !== 'no-photo.jpg' ? (
                          <img src={`http://localhost:5000${item.image}`} alt={item.itemName} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-gray-400 text-xs">No Img</span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.sport?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{item.location?.name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                    {item.totalQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <span className={`${item.availableQuantity === 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {item.availableQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* NEW: Bind the Edit button */}
                    <button onClick={() => openEditModal(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                    <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD/EDIT EQUIPMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-xl">
            {/* NEW: Dynamic Title */}
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Equipment' : 'Add New Equipment'}</h2>
            <form onSubmit={handleSubmit}>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input 
                  type="text" name="itemName" required
                  value={formData.itemName} onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g. Cricket Bat"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sport ID</label>
                <input 
                  type="text" name="sport" required
                  value={formData.sport} onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Paste Sport Object ID here"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location ID</label>
                <input 
                  type="text" name="location" required
                  value={formData.location} onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Paste Location Object ID here"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity</label>
                <input 
                  type="number" name="totalQuantity" min="1" required
                  value={formData.totalQuantity} onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {/* NEW: Dynamic Image Label */}
                  {editingId ? 'Update Image (Leave blank to keep current)' : 'Equipment Image'}
                </label>
                <input 
                  type="file" accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  {/* NEW: Dynamic Button Text */}
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