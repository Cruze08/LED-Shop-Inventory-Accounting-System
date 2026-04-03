import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export const login = (usr, pwd) => {
  return api.post('/method/login', { usr, pwd });
};

export const getItems = () => {
  return api.get('/resource/Item?fields=["name","item_code","item_name","item_group"]');
};

export const getItemPrices = () => {
  return api.get('/resource/Item Price?fields=["item_code","price_list_rate","price_list"]&filters=[["price_list","=","Standard Selling"]]');
};

export const getStockLevels = () => {
  return api.get('/resource/Bin?fields=["item_code","warehouse","actual_qty"]&limit_page_length=500');
};

export const getWarehouses = () => {
  return api.get('/resource/Warehouse?fields=["name","warehouse_name"]');
};

export const getCustomers = () => {
  return api.get('/resource/Customer?fields=["name","customer_name"]');
};

export const getCompanies = () => {
  return api.get('/resource/Company?fields=["name","company_name"]');
};

export const getCurrencies = () => {
  return api.get('/resource/Currency?fields=["name","currency_name"]');
};

export const getPriceLists = () => {
  return api.get('/resource/Price List?fields=["name"]');
};

export const getTaxTemplates = () => {
  return api.get('/resource/Sales Taxes and Charges Template?fields=["name","title"]');
};

export const getModesOfPayment = () => {
  return api.get('/resource/Mode of Payment?fields=["name"]');
};

export const getPaymentTermsTemplates = () => {
  return api.get('/resource/Payment Terms Template?fields=["name"]');
};

export const getTermsAndConditions = () => {
  return api.get('/resource/Terms and Conditions?fields=["name"]');
};

export const getCostCenters = () => {
  return api.get('/resource/Cost Center?fields=["name","cost_center_name"]');
};

export const getProjects = () => {
  return api.get('/resource/Project?fields=["name","project_name"]');
};

export const getSalesPartners = () => {
  return api.get('/resource/Sales Partner?fields=["name"]');
};

export const getTerritories = () => {
  return api.get('/resource/Territory?fields=["name"]');
};

export const getUOMs = () => {
  return api.get('/resource/UOM?fields=["name"]');
};

export const getAddresses = (linkDoctype, linkName) => {
  return api.get(`/resource/Address?filters=[["Dynamic Link","link_doctype","=","${linkDoctype}"],["Dynamic Link","link_name","=","${linkName}"]]&fields=["name","address_line1","city","state"]`);
};

export const getContacts = (linkDoctype, linkName) => {
  return api.get(`/resource/Contact?filters=[["Dynamic Link","link_doctype","=","${linkDoctype}"],["Dynamic Link","link_name","=","${linkName}"]]&fields=["name","first_name","last_name"]`);
};

export const createSalesInvoice = (customer_name, warehouse, items) => {
  // Items format: { item: "item_code", qty: 1, rate: 100 }
  return api.post('/resource/Sales Invoice', {
    customer_name,
    warehouse,
    items
  });
};

export const getInvoices = () => {
  return api.get('/resource/Sales Invoice?fields=["name","creation","customer_name","total_amount"]&order_by=creation desc&limit_page_length=5');
};

export const logout = () => {
  return api.post('/method/logout');
};

export const createItem = (item_code, item_name, item_group, selling_price) => {
  return api.post('/resource/Item', {
    item_code,
    item_name,
    item_group,
    selling_price
  });
};

export default api;
