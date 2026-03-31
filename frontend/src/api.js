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
  return api.get('/resource/LED Item?fields=["name","item_code","item_name","stock","selling_price"]');
};

export const getWarehouses = () => {
  return api.get('/resource/LED Warehouse?fields=["name","warehouse_name"]');
};

export const createSalesInvoice = (customer_name, warehouse, items) => {
  // Items format: { item: "item_code", qty: 1, rate: 100 }
  return api.post('/resource/LED Sales Invoice', {
    customer_name,
    warehouse,
    items
  });
};

export const getInvoices = () => {
  return api.get('/resource/LED Sales Invoice?fields=["name","creation","customer_name","total_amount"]&order_by=creation desc&limit_page_length=5');
};

export default api;
