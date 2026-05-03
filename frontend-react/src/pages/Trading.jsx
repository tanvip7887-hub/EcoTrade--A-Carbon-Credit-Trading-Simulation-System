import { useState, useEffect } from 'react';
import api from '../api';
import { ArrowRightLeft, CheckCircle, AlertCircle, Info, ShoppingBag, Send, TrendingDown, TrendingUp, Shield } from 'lucide-react';

const ComplianceBadge = ({ score }) => {
  const getStyle = (s) => {
    if (s >= 90) return { bg: '#ecfdf5', text: '#059669', label: 'Excellent' };
    if (s >= 70) return { bg: '#f0fdf4', text: '#16a34a', label: 'Good' };
    return { bg: '#fef2f2', text: '#dc2626', label: 'Critical' };
  };
  const style = getStyle(score || 0);
  return (
    <span style={{ backgroundColor: style.bg, color: style.text, padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 700 }}>
      {style.label}
    </span>
  );
};

export default function Trading({ user }) {
  const [companies, setCompanies] = useState([]);
  const [mode, setMode] = useState('sell'); // 'sell' or 'buy'
  const [partnerId, setPartnerId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCompanies(); }, []);

  async function fetchCompanies() {
    try {
      const res = await api.get('/companies');
      setCompanies(res.data);
    } catch (e) { console.error(e); }
  }

  const partners = companies.filter(c => c.company_id !== user.id);
  const myData = companies.find(c => c.company_id === user.id) || {};
  const partnerData = partners.find(c => c.company_id === partnerId) || null;

  const tradeAmount = parseFloat(amount || 0);
  
  // Projection Logic
  const myProjected = mode === 'sell' ? (myData.credits_balance - tradeAmount) : (myData.credits_balance + tradeAmount);
  const partnerProjected = mode === 'sell' ? (partnerData?.credits_balance + tradeAmount) : (partnerData?.credits_balance - tradeAmount);

  const handleTrade = async (e) => {
    e.preventDefault();
    setMessage(''); setError(''); setLoading(true);
    
    const tradeData = {
      seller_id: mode === 'sell' ? user.id : partnerId,
      buyer_id: mode === 'sell' ? partnerId : user.id,
      amount: tradeAmount
    };

    try {
      const res = await api.post('/trade', tradeData);
      setMessage(res.data.message || 'Trade executed successfully!');
      setAmount(''); setPartnerId('');
      fetchCompanies();
    } catch (err) {
      setError(err.response?.data?.error || 'Trade failed. Check balances.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      <div className="card" style={{ borderTop: '4px solid #1e3a8a' }}>
        <div className="card-header" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
          <div>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowRightLeft size={18} color="#1e3a8a" /> Credit Marketplace
            </div>
            <div className="card-subtitle">Manage trades for <span style={{ color: '#1e3a8a', fontWeight: 700 }}>{user.name}</span></div>
          </div>
          
          <div className="pill-tabs" style={{ background: '#f8fafc', padding: '4px', borderRadius: '12px' }}>
            <button className={`pill-tab ${mode === 'sell' ? 'active' : ''}`} onClick={() => { setMode('sell'); setPartnerId(''); setMessage(''); setError(''); }}>
              <Send size={14} style={{ marginRight: 6 }} /> Sell Credits
            </button>
            <button className={`pill-tab ${mode === 'buy' ? 'active' : ''}`} onClick={() => { setMode('buy'); setPartnerId(''); setMessage(''); setError(''); }}>
              <ShoppingBag size={14} style={{ marginRight: 6 }} /> Buy Credits
            </button>
          </div>
        </div>

        <div style={{ padding: '24px 0' }}>
          {message && <div className="alert alert-success" style={{ marginBottom: 20 }}>{message}</div>}
          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

          <form onSubmit={handleTrade}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">{mode === 'sell' ? 'Who is buying from you?' : 'Who are you buying from?'}</label>
                <select className="form-control" value={partnerId} onChange={e => setPartnerId(e.target.value)} required>
                  <option value="">Select Company...</option>
                  {partners.map(c => (
                    <option key={c.company_id} value={c.company_id}>
                      {c.name} (Balance: {c.credits_balance} T | Emissions: {c.emissions} T)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Transfer Amount (Tons)</label>
                <input type="number" className="form-control" placeholder="e.g. 100" value={amount} onChange={e => setAmount(e.target.value)} min="1" required />
              </div>
            </div>

            {partnerData && (
              <div style={{ marginTop: 32, animation: 'slideUp 0.4s ease-out' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Transaction Intelligence Preview
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {/* Your Account Preview */}
                  <div style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Your Account (You)</span>
                      <ComplianceBadge score={myData.eco_score} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{myData.credits_balance} T</div>
                      <ArrowRightLeft size={14} color="#94a3b8" />
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: mode === 'sell' ? '#dc2626' : '#16a34a' }}>
                        {myProjected} T
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>
                      {mode === 'sell' ? 'Credits will be deducted' : 'Credits will be added'}
                    </div>
                  </div>

                  {/* Partner Account Preview */}
                  <div style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{partnerData.name} ({mode === 'sell' ? 'Buyer' : 'Seller'})</span>
                      <ComplianceBadge score={partnerData.eco_score} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{partnerData.credits_balance} T</div>
                      <ArrowRightLeft size={14} color="#94a3b8" />
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: mode === 'sell' ? '#16a34a' : '#dc2626' }}>
                        {partnerProjected} T
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>
                      {mode === 'sell' ? 'Credits will be added' : 'Credits will be deducted'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 24, padding: 16, background: mode === 'sell' ? '#fff7f7' : '#f0fdf4', borderRadius: 12, border: `1px solid ${mode === 'sell' ? '#fecaca' : '#bbf7d0'}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                  {mode === 'sell' ? <TrendingDown size={18} color="#dc2626" /> : <TrendingUp size={18} color="#16a34a" />}
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: mode === 'sell' ? '#991b1b' : '#166534' }}>
                    {mode === 'sell' 
                      ? `Security Check: You are authorizing the transfer of ${tradeAmount} T to ${partnerData.name}.` 
                      : `Security Check: You are requesting to purchase ${tradeAmount} T from ${partnerData.name}.`}
                  </span>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 32, padding: '16px', background: '#1e3a8a', fontSize: '1rem' }} disabled={loading || !partnerId || tradeAmount <= 0}>
              {loading ? 'Processing...' : mode === 'sell' ? `Sell ${tradeAmount} Credits Now` : `Purchase ${tradeAmount} Credits Now`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
