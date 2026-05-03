import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { LogIn, User, Lock, ArrowRight, ShieldCheck, Briefcase } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ company_id: '', name: '', email: '', password: '', industry: 'Tech' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { company_id: formData.company_id, password: formData.password });
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('user', JSON.stringify({ company_id: formData.company_id, role: res.data.role }));
        navigate('/');
      } else {
        await api.post('/auth/register', formData);
        setIsLogin(true);
      }
    } catch (err) { setError(err.response?.data?.msg || 'Action failed.'); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>{isLogin ? 'Welcome Back' : 'Join EcoTrade'}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
              </div>
            </>
          )}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Company ID</label>
            <input type="text" className="form-control" value={formData.company_id} onChange={e => setFormData({ ...formData, company_id: e.target.value })} required />
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{isLogin ? 'Sign In' : 'Create Account'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.875rem' }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}>
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}
