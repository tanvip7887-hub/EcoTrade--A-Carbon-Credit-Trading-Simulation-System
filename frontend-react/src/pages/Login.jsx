import { useState } from 'react';
import { Building2, ShieldCheck, Leaf, BarChart3, ArrowRightLeft, Info } from 'lucide-react';
import api from '../api';

export default function Login({ onLogin }) {
  const [tab, setTab] = useState('company');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        company_id: username,
        password: password
      });
      
      const { access_token, role, company } = res.data;
      
      // Save token for future API calls
      localStorage.setItem('token', access_token);
      
      // Update app state
      onLogin({ 
        role: role, 
        id: role === 'admin' ? 'admin' : company.company_id,
        name: role === 'admin' ? 'Administrator' : company.name
      });
      
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Check your ID and password.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <BarChart3 size={18} />, text: 'Real-time emissions tracking & rankings' },
    { icon: <ArrowRightLeft size={18} />, text: 'Simulate carbon credit buying & selling' },
    { icon: <Leaf size={18} />, text: 'Eco-score grading powered by AVL Trees' },
    { icon: <Building2 size={18} />, text: 'Trade network visualization with Graphs' },
  ];

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-left-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={24} />
            </div>
            <div className="login-brand">EcoTrade</div>
          </div>
          <p className="login-tagline">Carbon Credit Trading Simulation System</p>

          <div style={{ marginBottom: '40px' }}>
            {features.map((f, i) => (
              <div className="login-feature" key={i}>
                <div className="login-feature-icon">{f.icon}</div>
                <span className="login-feature-text">{f.text}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 18px' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data Structures Used</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Hash Table', 'AVL Tree', 'Graph', 'Queue', 'Stack'].map(ds => (
                <span key={ds} style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  {ds}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Welcome back</h2>
          <p>Sign in to your EcoTrade account</p>

          <div className="login-tabs">
            <div className={`login-tab ${tab === 'company' ? 'active' : ''}`} onClick={() => { setTab('company'); setError(''); }}>
              Company Login
            </div>
            <div className={`login-tab ${tab === 'admin' ? 'active' : ''}`} onClick={() => { setTab('admin'); setError(''); }}>
              Admin Login
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <Info size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">{tab === 'admin' ? 'Admin Username' : 'Company ID'}</label>
              <input
                type="text"
                className="form-control"
                placeholder={tab === 'admin' ? 'e.g. admin' : 'e.g. C001'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              <ShieldCheck size={17} />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-hint">
            <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              {tab === 'admin'
                ? 'Admin credentials: admin / admin'
                : 'Use your Company ID (e.g. C001) and Password'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
