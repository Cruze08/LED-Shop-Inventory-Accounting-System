import React, { useState, useEffect } from 'react';
import { Plus, Search, X, Package } from 'lucide-react';
import { getItems, getItemPrices, getStockLevels, createItem } from '../api';
import { useNavigate } from 'react-router-dom';

const ITEM_GROUPS = ['All Item Groups', 'Products', 'Raw Material', 'Services', 'Sub Assemblies', 'Consumable'];
const UOMS = ['Nos', 'Kg', 'Metre', 'Box', 'Litre', 'Pair', 'Set', 'Bag', 'Gram'];
const WEIGHT_UOMS = ['Kg', 'g', 'Lb', 'oz'];
const VALUATION_METHODS = ['', 'FIFO', 'Moving Average', 'LIFO'];
const MR_TYPES = ['Purchase', 'Material Transfer', 'Material Issue', 'Manufacture', 'Customer Provided'];

const defaultItem = {
  item_code: '', item_name: '', item_group: 'All Item Groups', stock_uom: 'Nos',
  disabled: 0, allow_alternative_item: 0, is_stock_item: 1, has_variants: 0,
  opening_stock: '', valuation_rate: '', standard_rate: '', is_fixed_asset: 0,
  brand: '', description: '',
  // Inventory
  shelf_life_in_days: '', end_of_life: '', default_material_request_type: 'Purchase',
  valuation_method: '', warranty_period: '', weight_per_unit: '', weight_uom: 'Kg',
  has_batch_no: 0, has_serial_no: 0, create_new_batch: 0, has_expiry_date: 0,
  // Accounting
  enable_deferred_revenue: 0, no_of_months: '', enable_deferred_expense: 0, no_of_months_exp: '',
  // Purchasing
  purchase_uom: 'Nos', min_order_qty: '', safety_stock: '', lead_time_days: '',
  is_purchase_item: 1, is_customer_provided_item: 0, delivered_by_supplier: 0,
  // Sales
  sales_uom: 'Nos', grant_commission: 0, is_sales_item: 1, max_discount: '',
  // Quality
  inspection_required_before_purchase: 0, inspection_required_before_delivery: 0,
  // Manufacturing
  include_item_in_manufacturing: 1, is_sub_contracted_item: 0,
};

const TABS = [
  { key: 'details',       label: 'Details' },
  { key: 'inventory',     label: 'Inventory' },
  { key: 'accounting',    label: 'Accounting' },
  { key: 'purchasing',    label: 'Purchasing' },
  { key: 'sales',         label: 'Sales' },
  { key: 'tax',           label: 'Tax' },
  { key: 'quality',       label: 'Quality' },
  { key: 'manufacturing', label: 'Manufacturing' },
];

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [newItem, setNewItem] = useState(defaultItem);
  const [search, setSearch] = useState('');
  const [saveError, setSaveError] = useState('');
  const navigate = useNavigate();

  const set = (field, val) => setNewItem(prev => ({ ...prev, [field]: val }));

  const fetchItems = () => {
    setLoading(true);
    Promise.all([getItems(), getItemPrices(), getStockLevels()])
      .then(([itemsRes, pricesRes, stockRes]) => {
        const rawItems = itemsRes.data?.data || [];
        const priceMap = {};
        (pricesRes.data?.data || []).forEach(p => { priceMap[p.item_code] = p.price_list_rate; });
        const stockMap = {};
        (stockRes.data?.data || []).forEach(b => { stockMap[b.item_code] = (stockMap[b.item_code] || 0) + (b.actual_qty || 0); });
        setItems(rawItems.map(item => ({ ...item, selling_price: priceMap[item.item_code] ?? null, stock: stockMap[item.item_code] ?? 0 })));
        setLoading(false);
      })
      .catch(err => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) navigate('/login');
        else { console.error(err); setLoading(false); }
      });
  };

  useEffect(() => { fetchItems(); }, [navigate]);

  const openModal = () => { setShowAddModal(true); setActiveTab('details'); setSaveError(''); setNewItem(defaultItem); };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setSaveError('');
    setAddingItem(true);
    try {
      await createItem(newItem.item_code, newItem.item_name, newItem.item_group, Number(newItem.standard_rate) || 0);
      setShowAddModal(false);
      fetchItems();
    } catch (err) {
      const raw = err.response?.data?.exception || '';
      const match = raw.match(/frappe\.exceptions\.\w+:\s*(.+)/);
      setSaveError(match ? match[1].trim() : 'Failed to save item. Check required fields.');
    } finally {
      setAddingItem(false);
    }
  };

  const filtered = items.filter(it =>
    it.item_name?.toLowerCase().includes(search.toLowerCase()) ||
    it.item_code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Inventory Management</h1>
        <button className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={openModal}>
          <Plus size={18} /> Add New Item
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0 1rem' }}>
            <Search size={20} color="var(--text-muted)" />
            <input type="text" placeholder="Search items by name or SKU..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', flex: 1, padding: '0.75rem', outline: 'none', background: 'transparent' }} />
          </div>
        </div>

        {loading ? <p>Loading items...</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '620px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', color: 'var(--text-muted)' }}>
                  {['Item Code', 'Item Name', 'Item Group', 'Current Stock', 'Selling Price'].map(h => (
                    <th key={h} style={{ padding: '1rem 0.75rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No items found.</td></tr>
                ) : filtered.map(item => (
                  <tr key={item.name} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>{item.item_code}</td>
                    <td style={{ padding: '1rem 0.75rem' }}>{item.item_name}</td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span style={{ backgroundColor: 'rgba(37,99,235,0.1)', color: 'var(--color-primary)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontWeight: 600, fontSize: '0.875rem' }}>
                        {item.item_group}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span style={{ backgroundColor: item.stock < 10 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: item.stock < 10 ? 'var(--color-danger)' : 'var(--color-success)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontWeight: 600, fontSize: '0.875rem' }}>
                        {item.stock} Units
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      {item.selling_price != null ? `₹${item.selling_price}` : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No price set</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== ADD ITEM MODAL ===== */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '740px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ backgroundColor: 'rgba(37,99,235,0.1)', padding: '0.5rem', borderRadius: '8px', color: 'var(--color-primary)' }}><Package size={20} /></div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>New Item</h2>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>A Product or Service that is bought, sold or kept in stock</p>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            {/* Tab Bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '0 1.5rem', overflowX: 'auto', flexShrink: 0 }}>
              {TABS.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: '0.7rem 0.9rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: activeTab === t.key ? 700 : 500, color: activeTab === t.key ? 'var(--color-primary)' : 'var(--text-muted)', borderBottom: activeTab === t.key ? '2px solid var(--color-primary)' : '2px solid transparent', fontSize: '0.82rem', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleAddItem} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>

                {/* ── DETAILS ── */}
                {activeTab === 'details' && (<>
                  <Row>
                    <Field label="Item Code" required>
                      <input className="input-field" required placeholder="e.g. LED-9W-W" value={newItem.item_code} onChange={e => set('item_code', e.target.value)} style={iS} />
                    </Field>
                    <Field label="Item Name">
                      <input className="input-field" placeholder="e.g. 9W LED Bulb" value={newItem.item_name} onChange={e => set('item_name', e.target.value)} style={iS} />
                    </Field>
                  </Row>
                  <Row>
                    <Field label="Item Group" required>
                      <select className="input-field" required value={newItem.item_group} onChange={e => set('item_group', e.target.value)} style={iS}>{ITEM_GROUPS.map(g => <option key={g}>{g}</option>)}</select>
                    </Field>
                    <Field label="Default Unit of Measure" required>
                      <select className="input-field" required value={newItem.stock_uom} onChange={e => set('stock_uom', e.target.value)} style={iS}>{UOMS.map(u => <option key={u}>{u}</option>)}</select>
                    </Field>
                  </Row>
                  <Sec>Flags</Sec>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <CF label="Disabled" v={newItem.disabled} onChange={v => set('disabled', v)} />
                    <CF label="Allow Alternative Item" v={newItem.allow_alternative_item} onChange={v => set('allow_alternative_item', v)} />
                    <CF label="Maintain Stock" v={newItem.is_stock_item} onChange={v => set('is_stock_item', v)} />
                    <CF label="Has Variants" v={newItem.has_variants} onChange={v => set('has_variants', v)} />
                    <CF label="Is Fixed Asset" v={newItem.is_fixed_asset} onChange={v => set('is_fixed_asset', v)} />
                  </div>
                  <Sec>Pricing</Sec>
                  <Row>
                    <Field label="Opening Stock">
                      <input className="input-field" type="number" min="0" placeholder="0" value={newItem.opening_stock} onChange={e => set('opening_stock', e.target.value)} style={iS} />
                    </Field>
                    <Field label="Valuation Rate (₹)">
                      <input className="input-field" type="number" min="0" placeholder="0.00" value={newItem.valuation_rate} onChange={e => set('valuation_rate', e.target.value)} style={iS} />
                    </Field>
                  </Row>
                  <Row>
                    <Field label="Standard Selling Rate (₹)">
                      <input className="input-field" type="number" min="0" placeholder="0.00" value={newItem.standard_rate} onChange={e => set('standard_rate', e.target.value)} style={iS} />
                    </Field>
                    <Field label="Brand">
                      <input className="input-field" placeholder="e.g. Philips" value={newItem.brand} onChange={e => set('brand', e.target.value)} style={iS} />
                    </Field>
                  </Row>
                  <Sec>Description</Sec>
                  <textarea className="input-field" rows={3} placeholder="Short item description..." value={newItem.description} onChange={e => set('description', e.target.value)} style={{ ...iS, resize: 'vertical' }} />
                </>)}

                {/* ── INVENTORY ── */}
                {activeTab === 'inventory' && (<>
                  <Sec>Shelf Life & Expiry</Sec>
                  <Row>
                    <Field label="Shelf Life In Days">
                      <input className="input-field" type="number" min="0" placeholder="0" value={newItem.shelf_life_in_days} onChange={e => set('shelf_life_in_days', e.target.value)} style={iS} />
                    </Field>
                    <Field label="End of Life">
                      <input className="input-field" type="date" value={newItem.end_of_life} onChange={e => set('end_of_life', e.target.value)} style={iS} />
                    </Field>
                  </Row>
                  <Sec>Valuation & Requests</Sec>
                  <Row>
                    <Field label="Default Material Request Type">
                      <select className="input-field" value={newItem.default_material_request_type} onChange={e => set('default_material_request_type', e.target.value)} style={iS}>{MR_TYPES.map(t => <option key={t}>{t}</option>)}</select>
                    </Field>
                    <Field label="Valuation Method">
                      <select className="input-field" value={newItem.valuation_method} onChange={e => set('valuation_method', e.target.value)} style={iS}>{VALUATION_METHODS.map(v => <option key={v} value={v}>{v || '-- Default --'}</option>)}</select>
                    </Field>
                  </Row>
                  <Sec>Weight</Sec>
                  <Row>
                    <Field label="Weight Per Unit">
                      <input className="input-field" type="number" min="0" step="0.01" placeholder="0.00" value={newItem.weight_per_unit} onChange={e => set('weight_per_unit', e.target.value)} style={iS} />
                    </Field>
                    <Field label="Weight UOM">
                      <select className="input-field" value={newItem.weight_uom} onChange={e => set('weight_uom', e.target.value)} style={iS}>{WEIGHT_UOMS.map(u => <option key={u}>{u}</option>)}</select>
                    </Field>
                  </Row>
                  <Sec>Warranty</Sec>
                  <Field label="Warranty Period (in days)">
                    <input className="input-field" type="number" min="0" placeholder="0" value={newItem.warranty_period} onChange={e => set('warranty_period', e.target.value)} style={{ ...iS, maxWidth: '50%' }} />
                  </Field>
                  <Sec>Serial Nos & Batches</Sec>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <CF label="Has Batch No" v={newItem.has_batch_no} onChange={v => set('has_batch_no', v)} />
                    <CF label="Automatically Create New Batch" v={newItem.create_new_batch} onChange={v => set('create_new_batch', v)} />
                    <CF label="Has Expiry Date" v={newItem.has_expiry_date} onChange={v => set('has_expiry_date', v)} />
                    <CF label="Has Serial No" v={newItem.has_serial_no} onChange={v => set('has_serial_no', v)} />
                  </div>
                </>)}

                {/* ── ACCOUNTING ── */}
                {activeTab === 'accounting' && (<>
                  <Sec>Deferred Revenue</Sec>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <CF label="Enable Deferred Revenue" v={newItem.enable_deferred_revenue} onChange={v => set('enable_deferred_revenue', v)} />
                  </div>
                  {!!newItem.enable_deferred_revenue && (
                    <Field label="No of Months (Revenue)">
                      <input className="input-field" type="number" min="0" placeholder="12" value={newItem.no_of_months} onChange={e => set('no_of_months', e.target.value)} style={{ ...iS, maxWidth: '50%' }} />
                    </Field>
                  )}
                  <Sec>Deferred Expense</Sec>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <CF label="Enable Deferred Expense" v={newItem.enable_deferred_expense} onChange={v => set('enable_deferred_expense', v)} />
                  </div>
                  {!!newItem.enable_deferred_expense && (
                    <Field label="No of Months (Expense)">
                      <input className="input-field" type="number" min="0" placeholder="12" value={newItem.no_of_months_exp} onChange={e => set('no_of_months_exp', e.target.value)} style={{ ...iS, maxWidth: '50%' }} />
                    </Field>
                  )}
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1.5rem' }}>
                    Item Defaults (company-level accounting accounts) can be configured in ERPNext after saving.
                  </p>
                </>)}

                {/* ── PURCHASING ── */}
                {activeTab === 'purchasing' && (<>
                  <Sec>Purchase Settings</Sec>
                  <Row>
                    <Field label="Default Purchase UOM">
                      <select className="input-field" value={newItem.purchase_uom} onChange={e => set('purchase_uom', e.target.value)} style={iS}>{UOMS.map(u => <option key={u}>{u}</option>)}</select>
                    </Field>
                    <Field label="Lead Time in days">
                      <input className="input-field" type="number" min="0" placeholder="0" value={newItem.lead_time_days} onChange={e => set('lead_time_days', e.target.value)} style={iS} />
                    </Field>
                  </Row>
                  <Row>
                    <Field label="Minimum Order Qty">
                      <input className="input-field" type="number" min="0" placeholder="0" value={newItem.min_order_qty} onChange={e => set('min_order_qty', e.target.value)} style={iS} />
                    </Field>
                    <Field label="Safety Stock">
                      <input className="input-field" type="number" min="0" placeholder="0" value={newItem.safety_stock} onChange={e => set('safety_stock', e.target.value)} style={iS} />
                    </Field>
                  </Row>
                  <Sec>Flags</Sec>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <CF label="Allow Purchase" v={newItem.is_purchase_item} onChange={v => set('is_purchase_item', v)} />
                    <CF label="Is Customer Provided Item" v={newItem.is_customer_provided_item} onChange={v => set('is_customer_provided_item', v)} />
                    <CF label="Delivered by Supplier (Drop Ship)" v={newItem.delivered_by_supplier} onChange={v => set('delivered_by_supplier', v)} />
                  </div>
                </>)}

                {/* ── SALES ── */}
                {activeTab === 'sales' && (<>
                  <Sec>Sales Settings</Sec>
                  <Row>
                    <Field label="Default Sales UOM">
                      <select className="input-field" value={newItem.sales_uom} onChange={e => set('sales_uom', e.target.value)} style={iS}>{UOMS.map(u => <option key={u}>{u}</option>)}</select>
                    </Field>
                    <Field label="Max Discount (%)">
                      <input className="input-field" type="number" min="0" max="100" placeholder="0" value={newItem.max_discount} onChange={e => set('max_discount', e.target.value)} style={iS} />
                    </Field>
                  </Row>
                  <Sec>Flags</Sec>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <CF label="Allow Sales" v={newItem.is_sales_item} onChange={v => set('is_sales_item', v)} />
                    <CF label="Grant Commission" v={newItem.grant_commission} onChange={v => set('grant_commission', v)} />
                  </div>
                </>)}

                {/* ── TAX ── */}
                {activeTab === 'tax' && (
                  <div style={{ padding: '1rem 0' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      Item-level tax templates (like GST 18%, GST 5%, etc.) can be linked to this item after it is saved in ERPNext via <strong>Item Tax</strong> child table. This will override the default tax template set on the Sales/Purchase Invoice.
                    </p>
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(37,99,235,0.06)', borderRadius: '8px', border: '1px solid rgba(37,99,235,0.15)', fontSize: '0.875rem', color: '#374151' }}>
                      💡 Go to <strong>ERPNext → Stock → Item → {newItem.item_code || 'Your Item'} → Tax tab</strong> after saving to assign item-specific taxes.
                    </div>
                  </div>
                )}

                {/* ── QUALITY ── */}
                {activeTab === 'quality' && (<>
                  <Sec>Inspection Requirements</Sec>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <CF label="Inspection Required before Purchase" v={newItem.inspection_required_before_purchase} onChange={v => set('inspection_required_before_purchase', v)} />
                    <CF label="Inspection Required before Delivery" v={newItem.inspection_required_before_delivery} onChange={v => set('inspection_required_before_delivery', v)} />
                  </div>
                  <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Quality Inspection Templates can be linked after saving the item in ERPNext.
                  </p>
                </>)}

                {/* ── MANUFACTURING ── */}
                {activeTab === 'manufacturing' && (<>
                  <Sec>Manufacturing Settings</Sec>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <CF label="Include Item in Manufacturing" v={newItem.include_item_in_manufacturing} onChange={v => set('include_item_in_manufacturing', v)} />
                    <CF label="Supply Raw Materials for Purchase (Sub-contracted)" v={newItem.is_sub_contracted_item} onChange={v => set('is_sub_contracted_item', v)} />
                  </div>
                  <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Default BOM (Bill of Materials) can be linked after saving the item in ERPNext.
                  </p>
                </>)}

              </div>

              {/* Error */}
              {saveError && (
                <div style={{ margin: '0 1.5rem 0.5rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: 'var(--color-danger)', fontSize: '0.875rem' }}>
                  {saveError}
                </div>
              )}

              {/* Footer */}
              <div style={{ display: 'flex', gap: '1rem', padding: '1.1rem 1.5rem', borderTop: '1px solid #E2E8F0', justifyContent: 'flex-end', flexShrink: 0 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)} disabled={addingItem}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={addingItem}>
                  {addingItem ? 'Saving...' : '💾 Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──
const iS = { width: '100%', boxSizing: 'border-box' };

function Row({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.25rem' }}>{children}</div>;
}

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: '0.35rem' }}>
        {label}{required && <span style={{ color: 'red', marginLeft: '2px' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Sec({ children }) {
  return <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.35rem', margin: '1.1rem 0 0.65rem' }}>{children}</div>;
}

function CF({ label, v, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
      <input type="checkbox" checked={!!v} onChange={e => onChange(e.target.checked ? 1 : 0)} style={{ width: '15px', height: '15px', accentColor: 'var(--color-primary)', cursor: 'pointer' }} />
      {label}
    </label>
  );
}
