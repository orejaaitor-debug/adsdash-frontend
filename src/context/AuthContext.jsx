import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = import.meta.env.VITE_API_URL || '';

export function AuthProvider({ children }) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adsdash_token');
    if (token) {
      axios.get(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => { setClient(r.data.client); })
        .catch(() => { localStorage.removeItem('adsdash_token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(username, password) {
    const response = await axios.post(`${API}/api/auth/login`, { username, password });
    const { token, client } = response.data;
    localStorage.setItem('adsdash_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setClient(client);
    return client;
  }

  function logout() {
    localStorage.removeItem('adsdash_token');
    delete axios.defaults.headers.common['Authorization'];
    setClient(null);
  }

  useEffect(() => {
    const token = localStorage.getItem('adsdash_token');
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, [client]);

  return (
    <AuthContext.Provider value={{ client, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
