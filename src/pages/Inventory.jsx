import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { getItems } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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
  }, [navigate]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Inventory Management</h1>
        <button className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem' }}>
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
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
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
        )}
      </div>
    </div>
  );
}
