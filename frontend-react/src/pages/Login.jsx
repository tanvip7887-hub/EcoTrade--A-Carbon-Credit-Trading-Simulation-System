import { useState } from 'react';
import { Building2, ShieldCheck, Leaf, BarChart3, ArrowRightLeft, Info, UserPlus, Mail, Briefcase } from 'lucide-react';
import api from '../api';

export default function Login({ onLogin }) {
  const [view, setView] = useState('login'); 
  const [tab, setTab] = useState('company'); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [industry, setIndustry] = useState('Tech');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        company_id: username,
        password: password
      });
      
      const { access_token, role, company } = res.data;
      localStorage.setItem('token', access_token);
      
      onLogin({ 
        role: role, 
        id: role === 'admin' ? 'admin' : company.company_id,
        name: role === 'admin' ? 'Administrator' : company.name
      });
      
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);

    try {
      await api.post('/auth/register', {
        company_id: username,
        name: name,
        email: email,
        industry: industry,
        password: password
      });
      setSuccess('Account created! You can now log in.');
      setView('login');
      setUsername(''); setPassword(''); setName(''); setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. ID or Email might be taken.');
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
          {view === 'login' ? (
            <>
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

              {error && <div className="alert alert-error"><Info size={16} /> {error}</div>}
              {success && <div className="alert alert-success" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}><CheckCircle size={16} /> {success}</div>}

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

              {tab === 'company' && (
                <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: '#64748b' }}>
                  Don't have an account?{' '}
                  <button onClick={() => { setView('register'); setError(''); }} style={{ color: '#1e3a8a', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                    Register Company
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <h2>Create Account</h2>
              <p>Register your company in the registry</p>

              {error && <div className="alert alert-error"><Info size={16} /> {error}</div>}

              <form onSubmit={handleRegister} style={{ marginTop: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Company ID</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. C007"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. EcoCorp"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="email"
                      className="form-control"
                      style={{ paddingLeft: 40 }}
                      placeholder="contact@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Industry</label>
                  <div style={{ position: 'relative' }}>
                    <Briefcase size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <select
                      className="form-control"
                      style={{ paddingLeft: 40 }}
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    >
                      <option value="Tech">Technology</option>
                      <option value="Energy">Energy</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Finance">Finance</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-full" style={{ background: '#10b981' }} disabled={loading}>
                  <UserPlus size={17} />
                  {loading ? 'Creating Account...' : 'Register Company'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: '#64748b' }}>
                Already have an account?{' '}
                <button onClick={() => { setView('login'); setError(''); }} style={{ color: '#1e3a8a', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const CheckCircle = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
