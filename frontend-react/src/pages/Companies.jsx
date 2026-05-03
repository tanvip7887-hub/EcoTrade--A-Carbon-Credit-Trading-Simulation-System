import { useState, useEffect } from 'react';
import api from '../api';
import { Building2, PlusCircle, Search, CheckCircle, AlertCircle, Eye, Shield, Key, UserCheck, Activity } from 'lucide-react';

const EcoScoreTag = ({ score }) => {
  const getStyle = (s) => {
    if (s >= 90) return { bg: '#ecfdf5', text: '#059669', label: 'Excellent' };
    if (s >= 70) return { bg: '#f0fdf4', text: '#16a34a', label: 'Good' };
    if (s >= 50) return { bg: '#fffbeb', text: '#d97706', label: 'Fair' };
    return { bg: '#fef2f2', text: '#dc2626', label: 'Critical' };
  };
  const style = getStyle(score);
  return (
    <span style={{ 
      backgroundColor: style.bg, color: style.text, padding: '4px 12px', 
      borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, 
      display: 'inline-flex', alignItems: 'center', gap: 4, textTransform: 'uppercase'
    }}>
      <Shield size={10} /> {style.label}
    </span>
  );
};

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ id: '', name: '', password: '', emissions: '', credits: '', industry: 'Tech' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedComp, setSelectedComp] = useState(null);

  useEffect(() => { fetchCompanies(); }, []);

  async function fetchCompanies() {
    try {
      const res = await api.get('/companies');
      setCompanies(res.data);
    } catch (e) { console.error(e); }
  }

  const handleLookup = () => {
    const existing = companies.find(c => c.company_id === formData.id);
    if (existing) {
      setFormData({
        ...formData,
        name: existing.name,
        emissions: existing.emissions.toString(),
        credits: existing.credits_allocated.toString(),
        industry: existing.industry,
        password: existing.password
      });
      setMsg(`System: Data loaded for ${existing.name}`);
    } else {
      setErr('No company found with this ID');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg(''); setErr(''); setLoading(true);
    try {
      await api.post('/companies', {
        company_id: formData.id,
        name: formData.name,
        password: formData.password,
        emissions: parseFloat(formData.emissions || 0),
        credits_allocated: parseFloat(formData.credits || 0),
        industry: formData.industry
      });
      setMsg(`Success: ${formData.id} has been processed.`);
      fetchCompanies();
    } catch (err) { setErr(err.response?.data?.error || 'Database operation failed.'); }
    setLoading(false);
  };

  const filtered = companies.filter(c => {
    const s = search.toLowerCase();
    return !s || c.name.toLowerCase().includes(s) || c.company_id.toLowerCase().includes(s);
  });

  const totals = filtered.reduce((acc, c) => ({
    emissions: acc.emissions + c.emissions,
    credits: acc.credits + c.credits_allocated,
    balance: acc.balance + c.credits_balance
  }), { emissions: 0, credits: 0, balance: 0 });

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div className="card" style={{ borderTop: '4px solid #1e3a8a' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="card-title"><UserCheck size={18} /> Government Command Panel</div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setFormData({ id: '', name: '', password: '', emissions: '', credits: '', industry: 'Tech' })}>Reset Form</button>
        </div>
        
        {msg && <div className="alert alert-success" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>{msg}</div>}
        {err && <div className="alert alert-error">{err}</div>}
        
        <form onSubmit={handleRegister}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Search / Enter Company ID</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input type="text" className="form-control" placeholder="e.g. C001" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} required />
                <button type="button" className="btn btn-primary" onClick={handleLookup} disabled={!formData.id}>Load</button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Full Legal Name</label>
              <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Credit Allocation (Tons)</label>
              <input type="number" className="form-control" value={formData.credits} onChange={e => setFormData({ ...formData, credits: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Current Emissions (Tons)</label>
              <input type="number" className="form-control" value={formData.emissions} onChange={e => setFormData({ ...formData, emissions: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Assign Password</label>
              <input type="text" className="form-control" placeholder="Create or Update Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 24, padding: '12px 24px', background: '#1e3a8a' }} disabled={loading}>
            {loading ? 'Syncing...' : 'Authorize & Synchronize Records'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-title"><Building2 size={18} /> Authorized Entity Registry</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Search Filter:</span>
            <input 
              type="text" 
              placeholder="Filter table..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none' }}
            />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Entity ID</th>
                <th>Company Name</th>
                <th>Compliance Status</th>
                <th>Emissions</th>
                <th>Credits</th>
                <th>Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.company_id}>
                  <td><code>{c.company_id}</code></td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td><EcoScoreTag score={c.eco_score} /></td>
                  <td>{c.emissions} T</td>
                  <td>{c.credits_allocated} T</td>
                  <td style={{ color: c.credits_balance >= 0 ? '#10b981' : '#dc2626', fontWeight: 700 }}>{c.credits_balance}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedComp(c); setShowModal(true); }}>
                      <Eye size={14} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
              <tr style={{ fontWeight: 800, color: '#1e293b' }}>
                <td colSpan={3} style={{ textAlign: 'right', paddingRight: '24px' }}>REGISTRY TOTALS</td>
                <td>{totals.emissions} T</td>
                <td>{totals.credits} T</td>
                <td style={{ color: totals.balance >= 0 ? '#10b981' : '#dc2626' }}>{totals.balance}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {showModal && selectedComp && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: 450, borderRadius: 20, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12, color: '#0f172a' }}><Shield size={22} color="#3b82f6" /> Entity Passport</h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: 8 }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Full Name</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedComp.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: 8 }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Access ID</span>
                <code style={{ color: '#3b82f6' }}>{selectedComp.company_id}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: 8 }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}><Key size={14} /> Login Password</span>
                <code style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: 4 }}>{selectedComp.password}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: 8 }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Allocated Credits</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedComp.credits_allocated} T</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: 8 }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Current Emissions</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedComp.emissions} T</span>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 32, padding: '14px', background: '#1e3a8a' }} onClick={() => setShowModal(false)}>Close Passport</button>
          </div>
        </div>
      )}
    </div>
  );
}
