import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import { getItems, getWarehouses, createSalesInvoice } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Sales() {
  const [items, setItems] = useState([{ item: '', qty: 1, rate: 0, amount: 0 }]);
  const [availableItems, setAvailableItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [customerName, setCustomerName] = useState('Cash Customer');
  const [warehouse, setWarehouse] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getItems(), getWarehouses()]).then(([itemsRes, whRes]) => {
      setAvailableItems(itemsRes.data?.data || []);
      setWarehouses(whRes.data?.data || []);
      if (whRes.data?.data?.length > 0) setWarehouse(whRes.data.data[0].name);
    }).catch(err => {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        navigate('/login');
      }
    });
  }, [navigate]);

  const addItemRow = () => {
    setItems([...items, { item: '', qty: 1, rate: 0, amount: 0 }]);
  };

  const removeItemRow = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, value) => {
    const selectedItem = availableItems.find(i => i.name === value);
    const newItems = [...items];
    newItems[index].item = value;
    if (selectedItem) {
      newItems[index].rate = selectedItem.selling_price || 0;
      newItems[index].amount = newItems[index].qty * newItems[index].rate;
    }
    setItems(newItems);
  };

  const handleRowChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = Number(value);
    newItems[index].amount = newItems[index].qty * newItems[index].rate;
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, row) => sum + row.amount, 0);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const invoiceItems = items.map(row => ({
        item: row.item,
        qty: row.qty,
        rate: row.rate
      })).filter(row => row.item !== '');
      
      await createSalesInvoice(customerName, warehouse, invoiceItems);
      alert('Invoice created successfully!');
      setItems([{ item: '', qty: 1, rate: 0, amount: 0 }]);
      setLoading(false);
    } catch (err) {
      alert('Failed to create invoice.');
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Create Sales Invoice</h1>
      </div>

      <div className="card" style={{ maxWidth: '900px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="input-group">
            <label>Customer Name</label>
            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Cash Customer" />
          </div>
          <div className="input-group">
            <label>Warehouse</label>
            <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
              {warehouses.map(w => (
                <option key={w.name} value={w.name}>{w.warehouse_name}</option>
              ))}
            </select>
          </div>
        </div>

        <h3 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #E2E8F0' }}>Items</h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', marginBottom: '1.5rem', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.5rem', width: '45%' }}>Item</th>
                <th style={{ padding: '0.5rem', width: '15%' }}>Qty</th>
                <th style={{ padding: '0.5rem', width: '20%' }}>Rate (₹)</th>
                <th style={{ padding: '0.5rem', width: '15%' }}>Amount</th>
                <th style={{ padding: '0.5rem', width: '5%' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, index) => (
                <tr key={index}>
                  <td style={{ padding: '0.5rem' }}>
                    <select 
                      value={row.item} 
                      onChange={(e) => handleItemChange(index, e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #CBD5E1', borderRadius: '4px', fontFamily: 'inherit' }}
                    >
                      <option value="">Select Item...</option>
                      {availableItems.map(avail => (
                        <option key={avail.name} value={avail.name}>
                          {avail.item_name} (Stock: {avail.stock || 0})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input type="number" min="1" value={row.qty} onChange={(e) => handleRowChange(index, 'qty', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #CBD5E1', borderRadius: '4px', fontFamily: 'inherit' }} />
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <input type="number" value={row.rate} onChange={(e) => handleRowChange(index, 'rate', e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #CBD5E1', borderRadius: '4px', fontFamily: 'inherit' }} />
                  </td>
                  <td style={{ padding: '0.5rem', fontWeight: 600, fontSize: '1.125rem' }}>₹{row.amount.toFixed(2)}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                    <button onClick={() => removeItemRow(index)} style={{ color: 'var(--color-danger)', background: 'transparent', padding: '0.5rem' }}>
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }} onClick={addItemRow}>
          <Plus size={16} /> Add Row
        </button>

        <div style={{ borderTop: '2px solid #E2E8F0', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '350px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 700 }}>
              <span>Total Amount:</span>
              <span style={{ color: 'var(--color-primary)' }}>₹{totalAmount.toFixed(2)}</span>
            </div>
            <button disabled={loading} onClick={handleSubmit} className="btn btn-primary" style={{ width: '100%', display: 'flex', gap: '0.5rem', justifyContent: 'center', padding: '1rem', fontSize: '1.125rem', opacity: loading ? 0.7 : 1 }}>
              <CheckCircle size={20} /> {loading ? 'Submitting...' : 'Submit Invoice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
