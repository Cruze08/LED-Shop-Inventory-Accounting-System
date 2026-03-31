import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { getItems, createItem } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({ item_code: '', item_name: '', selling_price: '' });
  const navigate = useNavigate();

  const fetchItems = () => {
    setLoading(true);
    getItems().then(res => {
      setItems(res.data?.data || []);
      setLoading(false);
    }).catch(err => {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        navigate('/login');
      } else {
        console.error("error fetching items", err);
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    fetchItems();
  }, [navigate]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    setAddingItem(true);
    try {
      await createItem(newItem.item_code, newItem.item_name, Number(newItem.selling_price));
      setShowAddModal(false);
      setNewItem({ item_code: '', item_name: '', selling_price: '' });
      fetchItems();
    } catch (err) {
      console.error("Error creating item", err);
      // could add toast here
    } finally {
      setAddingItem(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Inventory Management</h1>
        <button 
          className="btn btn-primary" 
          style={{ display: 'flex', gap: '0.5rem' }}
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} /> Add New Item
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="input-group" style={{ flex: 1, flexDirection: 'row', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0 1rem' }}>
            <Search size={20} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search items by name or SKU..." 
              style={{ border: 'none', flex: 1, padding: '0.75rem', outline: 'none', background: 'transparent' }}
            />
          </div>
        </div>

        {loading ? <p>Loading items...</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem 0.75rem' }}>Item Code</th>
              <th style={{ padding: '1rem 0.75rem' }}>Item Name</th>
              <th style={{ padding: '1rem 0.75rem' }}>Current Stock</th>
              <th style={{ padding: '1rem 0.75rem' }}>Selling Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.name} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>{item.item_code}</td>
                <td style={{ padding: '1rem 0.75rem' }}>{item.item_name}</td>
                <td style={{ padding: '1rem 0.75rem' }}>
                  <span style={{ 
                    backgroundColor: item.stock < 100 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    color: item.stock < 100 ? 'var(--color-danger)' : 'var(--color-success)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}>
                    {item.stock || 0} Units
                  </span>
                </td>
                <td style={{ padding: '1rem 0.75rem' }}>₹{item.selling_price || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        )}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Add New Item</h2>
            <form onSubmit={handleAddItem}>
              <div className="input-group">
                <label>Item Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. 9W LED Bulb" 
                  required
                  value={newItem.item_name}
                  onChange={(e) => setNewItem({...newItem, item_name: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Item Code (SKU)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. LED-9W-W" 
                  required
                  value={newItem.item_code}
                  onChange={(e) => setNewItem({...newItem, item_code: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Selling Price (₹)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="e.g. 150" 
                  required
                  min="0"
                  value={newItem.selling_price}
                  onChange={(e) => setNewItem({...newItem, selling_price: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowAddModal(false)}
                  disabled={addingItem}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={addingItem}
                >
                  {addingItem ? 'Adding...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
