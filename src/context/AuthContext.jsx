import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adsdash_token');
    if (token) {
      axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => { setClient(r.data.client); })
        .catch(() => { localStorage.removeItem('adsdash_token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(username, password) {
    const response = await axios.post('/api/auth/login', { username, password });
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

  // Set token on every axios request
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
