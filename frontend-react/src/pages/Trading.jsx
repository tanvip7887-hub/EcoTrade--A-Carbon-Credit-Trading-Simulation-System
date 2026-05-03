import { useState, useEffect } from 'react';
import api from '../api';
import { ArrowRightLeft, RotateCcw, CheckCircle, AlertCircle, Info, ShoppingBag, Send } from 'lucide-react';

export default function Trading({ user }) {
  const [companies, setCompanies] = useState([]);
  const [mode, setMode] = useState('sell'); // 'sell' or 'buy'
  const [partnerId, setPartnerId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function fetchCompanies() {
    try {
      const res = await api.get('/companies');
      // For companies, we can only trade with OTHER companies
      setCompanies(user.role === 'admin' ? res.data : res.data.filter(c => c.company_id !== user.id));
    } catch (e) { console.error(e); }
  }

  // Determine seller and buyer IDs based on mode and user role
  const getTradeParties = () => {
    if (user.role === 'admin') {
      // Admin picks both, but we'll use a simplified UI for now or keep old logic
      return { sId: '', bId: partnerId }; // Admin logic simplified here for the new tab design
    }
    if (mode === 'sell') return { sId: user.id, bId: partnerId };
    return { sId: partnerId, bId: user.id };
  };

  const { sId, bId } = getTradeParties();
  const myData = companies.find(c => c.company_id === user.id) || {}; // This might not be in companies list due to filter
  // Wait, I need the user's data too. Let's fetch all then filter for the dropdown
  
  const handleTrade = async (e) => {
    e.preventDefault();
    setMessage(''); setError(''); setLoading(true);
    
    const tradeData = {
      seller_id: sId,
      buyer_id: bId,
      amount: parseFloat(amount)
    };

    try {
      const res = await api.post('/trade', tradeData);
      setMessage(res.data.message || 'Trade executed successfully!');
      setAmount('');
      setPartnerId('');
      fetchCompanies(); // Refresh balances
    } catch (err) {
      setError(err.response?.data?.error || 'Trade failed. Ensure you have sufficient balance.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      <div className="card">
        <div className="card-header" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
          <div>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowRightLeft size={18} color="#1e3a8a" /> Trade Marketplace
            </div>
            <div className="card-subtitle">Logged in as: <span style={{ color: '#1e3a8a', fontWeight: 700 }}>{user.name} ({user.id})</span></div>
          </div>
          
          <div className="pill-tabs" style={{ background: '#f8fafc', padding: '4px', borderRadius: '12px' }}>
            <button className={`pill-tab ${mode === 'sell' ? 'active' : ''}`} onClick={() => { setMode('sell'); setPartnerId(''); }}>
              <Send size={14} style={{ marginRight: 6 }} /> Sell Credits
            </button>
            <button className={`pill-tab ${mode === 'buy' ? 'active' : ''}`} onClick={() => { setMode('buy'); setPartnerId(''); }}>
              <ShoppingBag size={14} style={{ marginRight: 6 }} /> Buy Credits
            </button>
          </div>
        </div>

        <div style={{ padding: '24px 0' }}>
          {message && <div className="alert alert-success" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', marginBottom: 20 }}>
            <CheckCircle size={16} /> {message}
          </div>}
          {error && <div className="alert alert-error" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', marginBottom: 20 }}>
            <AlertCircle size={16} /> {error}
          </div>}

          <form onSubmit={handleTrade}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">{mode === 'sell' ? 'Select Buyer' : 'Select Seller'}</label>
                <select className="form-control" value={partnerId} onChange={e => setPartnerId(e.target.value)} required>
                  <option value="">{mode === 'sell' ? 'Who is buying?' : 'Who are you buying from?'}</option>
                  {companies.map(c => (
                    <option key={c.company_id} value={c.company_id}>
                      {c.name} (Balance: {c.credits_balance} T)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (Credits)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="e.g. 50" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  min="1" 
                  required 
                />
              </div>
            </div>

            <div style={{ marginTop: 24, padding: '20px', background: mode === 'sell' ? '#fff7f7' : '#f0fdf4', borderRadius: '16px', border: `1px solid ${mode === 'sell' ? '#fecaca' : '#bbf7d0'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: mode === 'sell' ? '#dc2626' : '#16a34a', textTransform: 'uppercase', marginBottom: 4 }}>
                    {mode === 'sell' ? 'Outgoing Transfer' : 'Incoming Transfer'}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                    {mode === 'sell' ? `You → ${partnerId || '...'}` : `${partnerId || '...'} → You`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{amount || '0'} T</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Carbon Credits</div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 24, padding: '14px', background: '#1e3a8a' }} disabled={loading || !partnerId}>
              {loading ? 'Processing...' : mode === 'sell' ? 'Confirm Sale' : 'Confirm Purchase'}
            </button>
          </form>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24, border: '1px dashed #e2e8f0', background: '#f8fafc' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ background: '#fff', padding: 12, borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <Info size={20} color="#3b82f6" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>Trading Policy</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Trades are real-time. Sellers must have sufficient credit balance. All transactions are logged for audit.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
