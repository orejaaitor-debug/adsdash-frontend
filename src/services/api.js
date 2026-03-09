import axios from 'axios';

export const metaApi = {
  getOverview: (dateFrom, dateTo) =>
    axios.get('/api/meta/overview', { params: { dateFrom, dateTo } }).then(r => r.data),
  getCampaigns: (dateFrom, dateTo) =>
    axios.get('/api/meta/campaigns', { params: { dateFrom, dateTo } }).then(r => r.data),
  getAdsets: (dateFrom, dateTo) =>
    axios.get('/api/meta/adsets', { params: { dateFrom, dateTo } }).then(r => r.data),
};

export const googleApi = {
  getOverview: (dateFrom, dateTo) =>
    axios.get('/api/google/overview', { params: { dateFrom, dateTo } }).then(r => r.data),
  getCampaigns: (dateFrom, dateTo) =>
    axios.get('/api/google/campaigns', { params: { dateFrom, dateTo } }).then(r => r.data),
};

// Format helpers
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
