import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL || '';
if (BASE) {
  axios.defaults.baseURL = BASE;
}
export const metaApi = {
  getOverview: (dateFrom, dateTo, accountIndex = 0) =>
    axios.get(`${BASE}/api/meta/overview`, { params: { dateFrom, dateTo, accountIndex } }).then(r => r.data),
  getCampaigns: (dateFrom, dateTo, accountIndex = 0) =>
    axios.get(`${BASE}/api/meta/campaigns`, { params: { dateFrom, dateTo, accountIndex } }).then(r => r.data),
  getAdsets: (dateFrom, dateTo, accountIndex = 0) =>
    axios.get(`${BASE}/api/meta/adsets`, { params: { dateFrom, dateTo, accountIndex } }).then(r => r.data),
  getDaily: (dateFrom, dateTo, accountIndex = 0) =>
    axios.get(`${BASE}/api/meta/daily`, { params: { dateFrom, dateTo, accountIndex } }).then(r => r.data),
  getCompare: (dateFrom, dateTo, accountIndex = 0) =>
    axios.get(`${BASE}/api/meta/compare`, { params: { dateFrom, dateTo, accountIndex } }).then(r => r.data),
};
export const googleApi = {
  getOverview: (dateFrom, dateTo) =>
    axios.get(`${BASE}/api/google/overview`, { params: { dateFrom, dateTo } }).then(r => r.data),
  getCampaigns: (dateFrom, dateTo) =>
    axios.get(`${BASE}/api/google/campaigns`, { params: { dateFrom, dateTo } }).then(r => r.data),
};
export function fmt(n, type = 'number') {
  if (n === null || n === undefined) return '—';
  switch (type) {
    case 'currency': return `$${parseFloat(n).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    case 'percent': return `${parseFloat(n).toFixed(2)}%`;
    case 'decimal': return parseFloat(n).toFixed(2);
    case 'roas': return `${parseFloat(n).toFixed(2)}x`;
    default: return parseInt(n).toLocaleString('es-AR');
  }
}
