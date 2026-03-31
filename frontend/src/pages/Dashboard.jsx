import React, { useState, useEffect } from 'react';
import { Package, AlertCircle, IndianRupee } from 'lucide-react';
import { getItems, getInvoices } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalSales: 0, totalStock: 0, lowStock: 0 });
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getItems(), getInvoices()]).then(([itemsRes, invRes]) => {
      const items = itemsRes.data.data || [];
      const invs = invRes.data.data || [];
      
      const totalStock = items.reduce((sum, item) => sum + (item.stock || 0), 0);
      const lowStock = items.filter(item => (item.stock || 0) < 100).length;
      const totalSales = invs.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      
      setStats({ totalSales, totalStock, lowStock });
      setInvoices(invs);
      setLoading(false);
    }).catch(err => {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        navigate('/login');
      } else {
        console.error(err);
        setLoading(false);
      }
    });
  }, [navigate]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <h1 style={{ marginBottom: '1.5rem' }}>Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--color-primary)' }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Total Sales</p>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>₹{stats.totalSales.toFixed(2)}</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--color-success)' }}>
            <Package size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Total Stock</p>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.totalStock} Items</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--color-danger)' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Low Stock Alerts</p>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.lowStock} Items</h2>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Recent Sales</h3>
        {invoices.length === 0 ? <p>No recent sales.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
              <th style={{ padding: '0.75rem' }}>Invoice #</th>
              <th style={{ padding: '0.75rem' }}>Customer</th>
              <th style={{ padding: '0.75rem' }}>Amount</th>
              <th style={{ padding: '0.75rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
            <tr key={inv.name} style={{ borderBottom: '1px solid #E2E8F0' }}>
              <td style={{ padding: '0.75rem', fontWeight: 600 }}>{inv.name}</td>
              <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{inv.customer_name}</td>
              <td style={{ padding: '0.75rem' }}>₹{inv.total_amount.toFixed(2)}</td>
              <td style={{ padding: '0.75rem' }}><span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Paid</span></td>
            </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}
