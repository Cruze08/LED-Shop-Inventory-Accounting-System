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
