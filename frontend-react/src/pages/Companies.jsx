import { useState, useEffect } from 'react';
import api from '../api';
import { Building2, PlusCircle, Search, CheckCircle, AlertCircle, Info, User, Shield, Briefcase, Eye } from 'lucide-react';

const EcoScoreTag = ({ score }) => {
  const getStyle = (s) => {
    if (s >= 90) return { bg: '#ecfdf5', text: '#059669', label: 'A+' };
    if (s >= 80) return { bg: '#f0fdf4', text: '#16a34a', label: 'A' };
    if (s >= 60) return { bg: '#fffbeb', text: '#d97706', label: 'B' };
    return { bg: '#fef2f2', text: '#dc2626', label: 'C' };
  };
  const style = getStyle(score);
  return (
    <span style={{ 
      backgroundColor: style.bg, color: style.text, padding: '4px 10px', 
      borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, 
      display: 'inline-flex', alignItems: 'center', gap: 4 
    }}>
      <Shield size={12} /> {style.label} ({score})
    </span>
  );
};

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [filterInd, setFilterInd] = useState('all');
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
        industry: existing.industry
      });
      setMsg(`Loaded data for ${existing.name}.`);
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
        emissions: parseFloat(formData.emissions),
        credits_allocated: parseFloat(formData.credits),
        industry: formData.industry
      });
      setMsg(`Company updated successfully.`);
      fetchCompanies();
    } catch (err) { setErr(err.response?.data?.error || 'Error saving.'); }
    setLoading(false);
  };

  const filtered = companies.filter(c => {
    const s = search.toLowerCase();
    return (!s || c.name.toLowerCase().includes(s) || c.company_id.toLowerCase().includes(s)) && 
           (filterInd === 'all' || c.industry === filterInd);
  });

  return (
    <div>
      <div className="card">
        <div className="card-header"><PlusCircle size={18} /> Register / Update Company</div>
        {msg && <div className="alert alert-success">{msg}</div>}
        {err && <div className="alert alert-error">{err}</div>}
        <form onSubmit={handleRegister}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Company ID</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" className="form-control" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} required />
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleLookup} disabled={!companies.some(c => c.company_id === formData.id)}>Load</button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Credits Allocated</label>
              <input type="number" className="form-control" value={formData.credits} onChange={e => setFormData({ ...formData, credits: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Login Password</label>
              <input type="password" className="form-control" placeholder="Optional for updates" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }} disabled={loading}>{loading ? 'Saving...' : 'Register / Update Company'}</button>
        </form>
      </div>

      <div className="card">
        <div className="card-header"><Building2 size={18} /> Registered Companies</div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Company</th>
                <th>Industry</th>
                <th>Eco-Score</th>
                <th>Emissions</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.company_id}>
                  <td><code>{c.company_id}</code></td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.industry}</td>
                  <td><EcoScoreTag score={c.eco_score} /></td>
                  <td>{c.emissions} Tons</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedComp(c); setShowModal(true); }}>
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedComp && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}><User size={20} /> Company Profile</h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <p><strong>Name:</strong> {selectedComp.name}</p>
              <p><strong>ID:</strong> {selectedComp.company_id}</p>
              <p><strong>Industry:</strong> {selectedComp.industry}</p>
              <p><strong>Allocated Credits:</strong> {selectedComp.credits_allocated}</p>
              <p><strong>Current Balance:</strong> {selectedComp.credits_balance}</p>
              <p><strong>Password:</strong> <code>{selectedComp.password}</code></p>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={() => setShowModal(false)}>Close Passport</button>
          </div>
        </div>
      )}
    </div>
  );
}
