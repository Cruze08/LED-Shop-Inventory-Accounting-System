import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, FileText } from 'lucide-react';
import {
  getItems, getItemPrices, getWarehouses, createSalesInvoice,
  getCustomers, getCompanies, getCurrencies, getPriceLists, getTaxTemplates,
  getModesOfPayment, getPaymentTermsTemplates, getTermsAndConditions,
  getCostCenters, getProjects, getSalesPartners, getTerritories, getUOMs,
  getAddresses, getContacts
} from '../api';
import { useNavigate } from 'react-router-dom';

const TODAY = new Date().toISOString().split('T')[0];
const SERIES = ['ACC-SINV-.YYYY.-', 'ACC-SINV-RET-.YYYY.-'];

const TABS = [
  { key: 'details',  label: 'Details' },
  { key: 'items',    label: 'Items' },
  { key: 'taxes',    label: 'Taxes & Charges' },
  { key: 'payments', label: 'Payments' },
  { key: 'address',  label: 'Contact & Address' },
  { key: 'terms',    label: 'Terms' },
  { key: 'more',     label: 'More Info' },
];

const defaultInvoice = {
  naming_series: 'ACC-SINV-.YYYY.-',
  customer: '',
  customer_name: '',
  tax_id: '',
  company: '',
  posting_date: TODAY,
  posting_time: '',
  due_date: '',
  is_pos: 0,
  is_return: 0,
  return_against: '',
  currency: 'INR',
  selling_price_list: 'Standard Selling',
  ignore_pricing_rule: 0,
  update_stock: 1,
  set_warehouse: '',
  additional_discount_percentage: '',
  discount_amount: '',
  // payments
  mode_of_payment: 'Cash',
  paid_amount: '',
  // address
  customer_address: '',
  contact_person: '',
  territory: '',
  shipping_address_name: '',
  company_address: '',
  // terms
  payment_terms_template: '',
  tc_name: '',
  terms: '',
  // more info
  po_no: '',
  po_date: '',
  cost_center: '',
  project: '',
  sales_partner: '',
  commission_rate: '',
  remarks: '',
  letter_head: '',
};

const emptyRow = () => ({ item_code: '', item_name: '', qty: 1, rate: 0, amount: 0, uom: 'Nos' });

export default function Sales() {
  const [invoice, setInvoice] = useState(defaultInvoice);
  const [rows, setRows] = useState([emptyRow()]);
  const [availableItems, setAvailableItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [priceLists, setPriceLists] = useState([]);
  const [taxTemplates, setTaxTemplates] = useState([]);
  const [modesOfPayment, setModesOfPayment] = useState([]);
  const [paymentTermsTemplates, setPaymentTermsTemplates] = useState([]);
  const [termsAndConditions, setTermsAndConditions] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [projects, setProjects] = useState([]);
  const [salesPartners, setSalesPartners] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [customerAddresses, setCustomerAddresses] = useState([]);
  const [customerContacts, setCustomerContacts] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const navigate = useNavigate();

  const set = (f, v) => setInvoice(prev => ({ ...prev, [f]: v }));

  useEffect(() => {
    Promise.all([
      getItems(), getItemPrices(), getWarehouses(), getCustomers(), getCompanies(),
      getCurrencies(), getPriceLists(), getTaxTemplates(), getModesOfPayment(),
      getPaymentTermsTemplates(), getTermsAndConditions(), getCostCenters(),
      getProjects(), getSalesPartners(), getTerritories(), getUOMs()
    ])
      .then(([
        itemsRes, pricesRes, whRes, custRes, compRes, currRes, plRes, taxRes,
        mopRes, pttRes, tcRes, ccRes, projRes, spRes, terRes, uomRes
      ]) => {
        const items = itemsRes.data?.data || [];
        const priceMap = {};
        (pricesRes.data?.data || []).forEach(p => { priceMap[p.item_code] = p.price_list_rate; });
        setAvailableItems(items.map(i => ({ ...i, selling_price: priceMap[i.item_code] ?? 0 })));

        const whs = whRes.data?.data || [];
        setWarehouses(whs);
        if (whs.length && !invoice.set_warehouse) set('set_warehouse', whs[0].name);

        setCustomers(custRes.data?.data || []);
        const comps = compRes.data?.data || [];
        setCompanies(comps);
        if (comps.length && !invoice.company) set('company', comps[0].name);

        setCurrencies(currRes.data?.data || []);
        setPriceLists(plRes.data?.data || []);
        setTaxTemplates(taxRes.data?.data || []);
        setModesOfPayment(mopRes.data?.data || []);
        setPaymentTermsTemplates(pttRes.data?.data || []);
        setTermsAndConditions(tcRes.data?.data || []);
        setCostCenters(ccRes.data?.data || []);
        setProjects(projRes.data?.data || []);
        setSalesPartners(spRes.data?.data || []);
        setTerritories(terRes.data?.data || []);
        setUoms(uomRes.data?.data || []);
      })
      .catch(err => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) navigate('/login');
      });
  }, [navigate]);

  useEffect(() => {
    if (invoice.customer) {
      getAddresses('Customer', invoice.customer).then(res => setCustomerAddresses(res.data?.data || []));
      getContacts('Customer', invoice.customer).then(res => setCustomerContacts(res.data?.data || []));
    } else {
      setCustomerAddresses([]);
      setCustomerContacts([]);
    }
  }, [invoice.customer]);

  // Item row helpers
  const addRow = () => setRows(r => [...r, emptyRow()]);
  const removeRow = (i) => setRows(r => r.length > 1 ? r.filter((_, idx) => idx !== i) : r);
  const handleItemSelect = (i, item_code) => {
    const found = availableItems.find(a => a.item_code === item_code);
    setRows(r => r.map((row, idx) => idx !== i ? row : {
      ...row,
      item_code,
      item_name: found?.item_name || '',
      rate: found?.selling_price || 0,
      uom: found?.stock_uom || 'Nos',
      amount: row.qty * (found?.selling_price || 0),
    }));
  };
  const handleRowNum = (i, field, val) => {
    setRows(r => r.map((row, idx) => {
      if (idx !== i) return row;
      const updated = { ...row, [field]: Number(val) };
      updated.amount = updated.qty * updated.rate;
      return updated;
    }));
  };

  const netTotal = rows.reduce((s, r) => s + r.amount, 0);
  const discountAmt = invoice.additional_discount_percentage
    ? (netTotal * Number(invoice.additional_discount_percentage)) / 100
    : Number(invoice.discount_amount) || 0;
  const grandTotal = Math.max(0, netTotal - discountAmt);

  const handleSubmit = async () => {
    setSaveError(''); setSaveSuccess('');
    const validRows = rows.filter(r => r.item_code);
    if (!validRows.length) { setSaveError('Please add at least one item.'); return; }
    setLoading(true);
    try {
      await createSalesInvoice(
        invoice.customer_name || invoice.customer || 'Walk-in Customer',
        invoice.set_warehouse,
        validRows.map(r => ({ item_code: r.item_code, qty: r.qty, rate: r.rate }))
      );
      setSaveSuccess('Sales Invoice created successfully!');
      setRows([emptyRow()]);
      setInvoice({ ...defaultInvoice, set_warehouse: invoice.set_warehouse });
      setActiveTab('details');
    } catch (err) {
      const raw = err.response?.data?.exception || '';
      const match = raw.match(/frappe\.exceptions\.\w+:\s*(.+)/);
      setSaveError(match ? match[1].trim() : 'Failed to create invoice. Check all required fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Sales Invoice</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <FileText size={16} /> New Document
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', overflow: 'hidden', width: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #E2E8F0' }}>

        {/* === Document Header === */}
        <div style={{ padding: '1.5rem 1.5rem 0', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={lS}>Series <span style={{ color: 'red' }}>*</span></label>
              <select className="input-field" value={invoice.naming_series} onChange={e => set('naming_series', e.target.value)} style={iS}>
                {SERIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lS}>Posting Date <span style={{ color: 'red' }}>*</span></label>
              <input className="input-field" type="date" value={invoice.posting_date} onChange={e => set('posting_date', e.target.value)} style={iS} />
            </div>
            <div>
              <label style={lS}>Customer</label>
              <select className="input-field" value={invoice.customer} onChange={e => {
                const c = customers.find(x => x.name === e.target.value);
                setInvoice(prev => ({ ...prev, customer: e.target.value, customer_name: c?.customer_name || '' }));
              }} style={iS}>
                <option value="">-- Select Customer --</option>
                {customers.map(c => <option key={c.name} value={c.name}>{c.customer_name || c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lS}>Payment Due Date</label>
              <input className="input-field" type="date" value={invoice.due_date} onChange={e => set('due_date', e.target.value)} style={iS} />
            </div>
          </div>

          {/* Tab Bar */}
          <div style={{ display: 'flex', overflowX: 'auto', gap: 0, background: '#F8FAFC', margin: '0 -1.5rem', padding: '0 1.5rem' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{ padding: '0.75rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: activeTab === t.key ? 700 : 500, color: activeTab === t.key ? 'var(--color-primary)' : 'var(--text-muted)', borderBottom: activeTab === t.key ? '3px solid var(--color-primary)' : '3px solid transparent', fontSize: '0.82rem', whiteSpace: 'nowrap', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* === Tab Content === */}
        <div style={{ padding: '1.5rem', minHeight: '320px' }}>

          {/* ── DETAILS ── */}
          {activeTab === 'details' && (<>
            <R2>
              <F label="Customer Name">
                <input className="input-field" placeholder="e.g. Walk-in Customer" value={invoice.customer_name} onChange={e => set('customer_name', e.target.value)} style={iS} />
              </F>
              <F label="Tax ID">
                <input className="input-field" placeholder="Calculated from Customer" disabled value={invoice.tax_id} style={iS} />
              </F>
            </R2>
            <R2>
              <F label="Company">
                <select className="input-field" value={invoice.company} onChange={e => set('company', e.target.value)} style={iS}>
                  {companies.map(c => <option key={c.name} value={c.name}>{c.company_name || c.name}</option>)}
                </select>
              </F>
              <F label="Posting Time">
                <input className="input-field" type="time" value={invoice.posting_time} onChange={e => set('posting_time', e.target.value)} style={iS} />
              </F>
            </R2>
            <Sec>Currency & Price List</Sec>
            <R2>
              <F label="Currency">
                <select className="input-field" value={invoice.currency} onChange={e => set('currency', e.target.value)} style={iS}>
                  {currencies.length ? currencies.map(c => <option key={c.name} value={c.name}>{c.name}</option>) : <option>INR</option>}
                </select>
              </F>
              <F label="Price List">
                <select className="input-field" value={invoice.selling_price_list} onChange={e => set('selling_price_list', e.target.value)} style={iS}>
                  {priceLists.map(pl => <option key={pl.name} value={pl.name}>{pl.name}</option>)}
                  {!priceLists.length && <option>Standard Selling</option>}
                </select>
              </F>
            </R2>
            <Sec>Flags</Sec>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <CF label="Include Payment (POS)" v={invoice.is_pos} onChange={v => set('is_pos', v)} />
              <CF label="Is Return (Credit Note)" v={invoice.is_return} onChange={v => set('is_return', v)} />
              <CF label="Update Stock" v={invoice.update_stock} onChange={v => set('update_stock', v)} />
              <CF label="Ignore Pricing Rule" v={invoice.ignore_pricing_rule} onChange={v => set('ignore_pricing_rule', v)} />
            </div>
            <R2>
              {!!invoice.update_stock && (
                <L label="Source Warehouse" v={invoice.set_warehouse} onChange={v => set('set_warehouse', v)} options={warehouses} />
              )}
              {!!invoice.is_return && (
                <F label="Return Against">
                  <input className="input-field" placeholder="Sales Invoice ID" value={invoice.return_against} onChange={e => set('return_against', e.target.value)} style={iS} />
                </F>
              )}
            </R2>
          </>)}

          {/* ── ITEMS ── */}
          {activeTab === 'items' && (<>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    <th style={{ padding: '0.6rem 0.5rem', width: '30%' }}>Item</th>
                    <th style={{ padding: '0.6rem 0.5rem', width: '15%' }}>UOM</th>
                    <th style={{ padding: '0.6rem 0.5rem', width: '15%' }}>Warehouse</th>
                    <th style={{ padding: '0.6rem 0.5rem', width: '10%' }}>Qty</th>
                    <th style={{ padding: '0.6rem 0.5rem', width: '12%' }}>Rate (₹)</th>
                    <th style={{ padding: '0.6rem 0.5rem', width: '13%' }}>Amount</th>
                    <th style={{ padding: '0.6rem 0.5rem', width: '5%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.5rem' }}>
                        <select value={row.item_code} onChange={e => handleItemSelect(i, e.target.value)}
                          style={tS}>
                          <option value="">Select Item...</option>
                          {availableItems.map(a => <option key={a.item_code} value={a.item_code}>{a.item_name} ({a.item_code})</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <select value={row.uom} onChange={e => setRows(prev => prev.map((r, idx) => idx === i ? { ...r, uom: e.target.value } : r))} style={tS}>
                          {uoms.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                          {!uoms.length && <option>Nos</option>}
                        </select>
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <select value={row.warehouse || invoice.set_warehouse} onChange={e => setRows(prev => prev.map((r, idx) => idx === i ? { ...r, warehouse: e.target.value } : r))} style={tS}>
                          <option value="">(Default)</option>
                          {warehouses.map(w => <option key={w.name} value={w.name}>{w.warehouse_name || w.name}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <input type="number" min="1" value={row.qty} onChange={e => handleRowNum(i, 'qty', e.target.value)}
                          style={{ width: '100%', padding: '0.6rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontFamily: 'inherit', textAlign: 'right' }} />
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <input type="number" min="0" value={row.rate} onChange={e => handleRowNum(i, 'rate', e.target.value)}
                          style={{ width: '100%', padding: '0.6rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontFamily: 'inherit', textAlign: 'right' }} />
                      </td>
                      <td style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'right' }}>₹{row.amount.toFixed(2)}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <button onClick={() => removeRow(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn btn-outline" style={{ marginTop: '0.75rem', display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.875rem' }} onClick={addRow}>
              <Plus size={15} /> Add Row
            </button>

            {/* Totals Summary */}
            <div style={{ marginTop: '1.5rem', borderTop: '2px solid #E2E8F0', paddingTop: '1rem' }}>
              <Sec>Discount</Sec>
              <R2>
                <F label="Additional Discount (%)">
                  <input className="input-field" type="number" min="0" max="100" placeholder="0" value={invoice.additional_discount_percentage} onChange={e => set('additional_discount_percentage', e.target.value)} style={iS} />
                </F>
                <F label="Discount Amount (₹)">
                  <input className="input-field" type="number" min="0" placeholder="0.00" value={invoice.discount_amount} onChange={e => set('discount_amount', e.target.value)} style={iS} />
                </F>
              </R2>
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '340px', marginLeft: 'auto' }}>
                <SummaryRow label="Net Total" val={`₹${netTotal.toFixed(2)}`} />
                {discountAmt > 0 && <SummaryRow label="Discount" val={`-₹${discountAmt.toFixed(2)}`} color="var(--color-danger)" />}
                <SummaryRow label="Grand Total" val={`₹${grandTotal.toFixed(2)}`} big />
              </div>
            </div>
          </>)}

          {/* ── TAXES & CHARGES ── */}
          {activeTab === 'taxes' && (
            <div>
              <R2>
                <F label="Taxes and Charges Template">
                  <select className="input-field" value={invoice.taxes_and_charges} onChange={e => set('taxes_and_charges', e.target.value)} style={iS}>
                    <option value="">-- Select Tax Template --</option>
                    {taxTemplates.map(t => <option key={t.name} value={t.name}>{t.title || t.name}</option>)}
                  </select>
                </F>
                <F label="Shipping Rule">
                  <input className="input-field" placeholder="Optional shipping rule" style={iS} />
                </F>
              </R2>
              <Sec>Tax Breakdown</Sec>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Taxes will auto-populate based on the selected Tax Template. You can also add line-by-line taxes in ERPNext directly.
              </p>
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(37,99,235,0.05)', borderRadius: '8px', border: '1px solid rgba(37,99,235,0.12)', fontSize: '0.875rem' }}>
                💡 <strong>Tip:</strong> Set up <em>Sales Taxes and Charges Templates</em> in ERPNext for automatic GST calculation.
              </div>
            </div>
          )}

          {/* ── PAYMENTS ── */}
          {activeTab === 'payments' && (<>
            <Sec>Payment Details</Sec>
            <R2>
              <L label="Mode of Payment" v={invoice.mode_of_payment} onChange={v => set('mode_of_payment', v)} options={modesOfPayment} />
              <F label="Paid Amount (₹)">
                <input className="input-field" type="number" min="0" placeholder={grandTotal.toFixed(2)} value={invoice.paid_amount} onChange={e => set('paid_amount', e.target.value)} style={iS} />
              </F>
            </R2>
            <Sec>Totals Summary</Sec>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '340px' }}>
              <SummaryRow label="Grand Total" val={`₹${grandTotal.toFixed(2)}`} big />
              <SummaryRow label="Paid Amount" val={`₹${Number(invoice.paid_amount || 0).toFixed(2)}`} color="var(--color-success)" />
              <SummaryRow label="Outstanding" val={`₹${Math.max(0, grandTotal - Number(invoice.paid_amount || 0)).toFixed(2)}`} />
            </div>
          </>)}

          {/* ── CONTACT & ADDRESS ── */}
          {activeTab === 'address' && (<>
            <Sec>Billing Address</Sec>
            <R2>
              <F label="Customer Address">
                <select className="input-field" value={invoice.customer_address} onChange={e => set('customer_address', e.target.value)} style={iS}>
                  <option value="">-- Select Address --</option>
                  {customerAddresses.map(a => <option key={a.name} value={a.name}>{a.address_line1}, {a.city}</option>)}
                </select>
              </F>
              <F label="Contact Person">
                <select className="input-field" value={invoice.contact_person} onChange={e => set('contact_person', e.target.value)} style={iS}>
                  <option value="">-- Select Contact --</option>
                  {customerContacts.map(c => <option key={c.name} value={c.name}>{c.first_name} {c.last_name}</option>)}
                </select>
              </F>
            </R2>
            <R2>
              <L label="Territory" v={invoice.territory} onChange={v => set('territory', v)} options={territories} />
              <F label="Shipping Address">
                <select className="input-field" value={invoice.shipping_address_name} onChange={e => set('shipping_address_name', e.target.value)} style={iS}>
                  <option value="">-- Select Address --</option>
                  {customerAddresses.map(a => <option key={a.name} value={a.name}>{a.address_line1}, {a.city}</option>)}
                </select>
              </F>
            </R2>
            <Sec>Company Address</Sec>
            <F label="Company Address">
              <input className="input-field" placeholder="Your company address" value={invoice.company_address} onChange={e => set('company_address', e.target.value)} style={{ ...iS, maxWidth: '50%' }} />
            </F>
          </>)}

          {/* ── TERMS ── */}
          {activeTab === 'terms' && (<>
            <Sec>Payment Terms</Sec>
            <R2>
              <L label="Payment Terms Template" v={invoice.payment_terms_template} onChange={v => set('payment_terms_template', v)} options={paymentTermsTemplates} />
            </R2>
            <Sec>Terms & Conditions</Sec>
            <R2>
              <L label="Terms & Conditions Template" v={invoice.tc_name} onChange={v => set('tc_name', v)} options={termsAndConditions} />
            </R2>
            <F label="Terms & Conditions (Text)">
              <textarea className="input-field" rows={5} placeholder="Enter terms and conditions..." value={invoice.terms} onChange={e => set('terms', e.target.value)} style={{ ...iS, resize: 'vertical' }} />
            </F>
          </>)}

          {/* ── MORE INFO ── */}
          {activeTab === 'more' && (<>
            <Sec>Customer PO Details</Sec>
            <R2>
              <F label="Customer PO No.">
                <input className="input-field" placeholder="PO-2024-001" value={invoice.po_no} onChange={e => set('po_no', e.target.value)} style={iS} />
              </F>
              <F label="Customer PO Date">
                <input className="input-field" type="date" value={invoice.po_date} onChange={e => set('po_date', e.target.value)} style={iS} />
              </F>
            </R2>
            <Sec>Accounting</Sec>
            <R2>
              <L label="Cost Center" v={invoice.cost_center} onChange={v => set('cost_center', v)} options={costCenters} />
              <L label="Project" v={invoice.project} onChange={v => set('project', v)} options={projects} />
            </R2>
            <Sec>Sales Team</Sec>
            <R2>
              <L label="Sales Partner" v={invoice.sales_partner} onChange={v => set('sales_partner', v)} options={salesPartners} />
              <F label="Commission Rate (%)">
                <input className="input-field" type="number" min="0" max="100" placeholder="0" value={invoice.commission_rate} onChange={e => set('commission_rate', e.target.value)} style={iS} />
              </F>
            </R2>
            <Sec>Remarks</Sec>
            <textarea className="input-field" rows={3} placeholder="Internal remarks..." value={invoice.remarks} onChange={e => set('remarks', e.target.value)} style={{ ...iS, resize: 'vertical' }} />
          </>)}
        </div>

        {/* === Footer === */}
        {saveError && (
          <div style={{ margin: '0 1.5rem 0.5rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: 'var(--color-danger)', fontSize: '0.875rem' }}>
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div style={{ margin: '0 1.5rem 0.5rem', padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', color: 'var(--color-success)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={16} /> {saveSuccess}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderTop: '1px solid #E2E8F0' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            Grand Total: <span style={{ color: 'var(--color-primary)' }}>₹{grandTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={() => { setInvoice(defaultInvoice); setRows([emptyRow()]); setSaveError(''); setSaveSuccess(''); }}>Reset</button>
            <button className="btn btn-primary" disabled={loading} onClick={handleSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <CheckCircle size={18} /> {loading ? 'Submitting...' : 'Submit Invoice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──
const lS = { display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: '0.35rem' };
const iS = { width: '100%', boxSizing: 'border-box' };
const tS = { width: '100%', padding: '0.6rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.875rem', background: '#fff' };

function L({ label, v, onChange, options }) {
  return (
    <F label={label}>
      <select className="input-field" value={v} onChange={e => onChange(e.target.value)} style={iS}>
        <option value="">-- Select --</option>
        {options.map(o => <option key={o.name} value={o.name}>{o.title || o.name || o.cost_center_name || o.project_name}</option>)}
      </select>
    </F>
  );
}
function R2({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1rem' }}>{children}</div>;
}
function F({ label, required, children }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label style={lS}>{label}{required && <span style={{ color: 'red', marginLeft: '2px' }}>*</span>}</label>
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
function SummaryRow({ label, val, big, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: big ? '0.6rem 0' : '0.3rem 0', borderTop: big ? '2px solid #E2E8F0' : 'none', fontWeight: big ? 700 : 500, fontSize: big ? '1.05rem' : '0.9rem' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: color || 'inherit' }}>{val}</span>
    </div>
  );
}
