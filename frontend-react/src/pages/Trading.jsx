import { useState, useEffect } from 'react';
import api from '../api';
import { ArrowRightLeft, CheckCircle, AlertCircle, Info, ShoppingBag, Send, TrendingDown, TrendingUp, RotateCcw, Hash, Layers, Share2, ClipboardList } from 'lucide-react';

export default function Trading({ user }) {
  const [companies, setCompanies] = useState([]);
  const [mode, setMode] = useState('sell'); // For companies
  const [sellerId, setSellerId] = useState('');
  const [buyerId, setBuyerId] = useState('');
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

  const handleTrade = async (e) => {
    e.preventDefault();
    setMessage(''); setError(''); setLoading(true);
    
    // Determine parties
    const sId = user.role === 'admin' ? sellerId : (mode === 'sell' ? user.id : sellerId);
    const bId = user.role === 'admin' ? buyerId : (mode === 'sell' ? buyerId : user.id);

    try {
      const res = await api.post('/trade', { seller_id: sId, buyer_id: bId, amount: parseFloat(amount) });
      setMessage(res.data.message || 'Trade successful');
      setAmount(''); setSellerId(''); setBuyerId('');
      fetchCompanies();
    } catch (err) {
      setError(err.response?.data?.error || 'Trade failed.');
    }
    setLoading(false);
  };

  const handleUndo = async () => {
    try {
      const res = await api.post('/trade/undo');
      setMessage(res.data.message || 'Last trade reverted successfully');
      fetchCompanies();
    } catch (err) { setError(err.response?.data?.error || 'No trades to undo.'); }
  };

  const tradeAmount = parseFloat(amount || 0);
  const sellerData = companies.find(c => c.company_id === (user.role === 'admin' ? sellerId : (mode === 'sell' ? user.id : sellerId)));
  const buyerData = companies.find(c => c.company_id === (user.role === 'admin' ? buyerId : (mode === 'sell' ? buyerId : user.id)));

  // If user is company, we filter partners for the partner dropdown
  const partners = companies.filter(c => c.company_id !== user.id);

  if (user.role === 'admin') {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <div className="card-title" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                <ArrowRightLeft size={22} color="#1e3a8a" /> Execute Carbon Credit Trade
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>
                Data Structure: Queue logs trades, Stack enables undo
              </div>
            </div>
            <button onClick={handleUndo} className="btn" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 16px', fontWeight: 600 }}>
              <RotateCcw size={16} /> Undo Last Trade
            </button>
          </div>

          {message && <div className="alert alert-success" style={{ marginBottom: 24 }}><CheckCircle size={16} /> {message}</div>}
          {error && <div className="alert alert-error" style={{ marginBottom: 24 }}><AlertCircle size={16} /> {error}</div>}

          <form onSubmit={handleTrade}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Seller Company</label>
                <select className="form-control" value={sellerId} onChange={e => setSellerId(e.target.value)} required>
                  <option value="">Select seller...</option>
                  {companies.map(c => <option key={c.company_id} value={c.company_id}>{c.name} ({c.company_id})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Buyer Company</label>
                <select className="form-control" value={buyerId} onChange={e => setBuyerId(e.target.value)} required>
                  <option value="">Select buyer...</option>
                  {companies.map(c => <option key={c.company_id} value={c.company_id}>{c.name} ({c.company_id})</option>)}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>Amount of Credits to Transfer</label>
              <input type="number" className="form-control" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 200" required />
            </div>

            {(sellerData || buyerData) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div style={{ padding: 20, background: '#fff1f2', borderRadius: 12, border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', marginBottom: 4 }}>Seller</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{sellerData?.name || '...'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Current Balance: <span style={{ fontWeight: 600 }}>{sellerData?.credits_balance || 0}</span></div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>After Trade: <span style={{ color: '#dc2626', fontWeight: 800 }}>{(sellerData?.credits_balance || 0) - tradeAmount}</span></div>
                </div>
                <div style={{ padding: 20, background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', marginBottom: 4 }}>Buyer</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{buyerData?.name || '...'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Current Balance: <span style={{ fontWeight: 600 }}>{buyerData?.credits_balance || 0}</span></div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>After Trade: <span style={{ color: '#16a34a', fontWeight: 800 }}>{(buyerData?.credits_balance || 0) + tradeAmount}</span></div>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" style={{ padding: '14px', background: '#1e3a8a' }}>
              <ArrowRightLeft size={18} /> Execute Trade
            </button>
          </form>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Info size={18} color="#1e3a8a" />
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>How Trading Works</div>
            </div>
            <ol style={{ fontSize: '0.8rem', color: '#475569', paddingLeft: 20, lineHeight: 1.6 }}>
              <li>Select a seller company with surplus credits.</li>
              <li>Select a buyer company that needs credits.</li>
              <li>Enter the number of credits to transfer.</li>
              <li>Click Execute Trade to process.</li>
            </ol>
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Share2 size={18} color="#1e3a8a" />
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Data Structures in Use</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span className="badge" style={{ background: '#eff6ff', color: '#1e3a8a' }}><Hash size={12} /> Hash Table: Fast O(1) lookup</span>
              <span className="badge" style={{ background: '#f0fdf4', color: '#16a34a' }}><ClipboardList size={12} /> Queue: FIFO trade logging</span>
              <span className="badge" style={{ background: '#fef2f2', color: '#dc2626' }}><Layers size={12} /> Stack: LIFO undo operations</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Company View (Tabs)
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      <div className="card">
        <div className="card-header" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
          <div>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowRightLeft size={18} color="#1e3a8a" /> Trade Marketplace
            </div>
            <div className="card-subtitle">Logged in as: <span style={{ color: '#1e3a8a', fontWeight: 700 }}>{user.name}</span></div>
          </div>
          
          <div className="pill-tabs" style={{ background: '#f8fafc', padding: '4px', borderRadius: '12px' }}>
            <button className={`pill-tab ${mode === 'sell' ? 'active' : ''}`} onClick={() => { setMode('sell'); setSellerId(''); setBuyerId(''); setMessage(''); }}>
              <Send size={14} style={{ marginRight: 6 }} /> Sell Credits
            </button>
            <button className={`pill-tab ${mode === 'buy' ? 'active' : ''}`} onClick={() => { setMode('buy'); setSellerId(''); setBuyerId(''); setMessage(''); }}>
              <ShoppingBag size={14} style={{ marginRight: 6 }} /> Buy Credits
            </button>
          </div>
        </div>

        <div style={{ padding: '24px 0' }}>
          {message && <div className="alert alert-success" style={{ marginBottom: 20 }}><CheckCircle size={16} /> {message}</div>}
          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}><AlertCircle size={16} /> {error}</div>}

          <form onSubmit={handleTrade}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">{mode === 'sell' ? 'Who is buying from you?' : 'Who are you buying from?'}</label>
                <select className="form-control" value={mode === 'sell' ? buyerId : sellerId} onChange={e => mode === 'sell' ? setBuyerId(e.target.value) : setSellerId(e.target.value)} required>
                  <option value="">Select Company...</option>
                  {partners.map(c => (
                    <option key={c.company_id} value={c.company_id}>
                      {c.name} (Balance: {c.credits_balance} T)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Transfer Amount (Tons)</label>
                <input type="number" className="form-control" placeholder="e.g. 100" value={amount} onChange={e => setAmount(e.target.value)} min="1" required />
              </div>
            </div>

            {(sellerData || buyerData) && (
              <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Your Account</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{mode === 'sell' ? sellerData?.credits_balance : buyerData?.credits_balance} T</div>
                    <ArrowRightLeft size={14} color="#94a3b8" />
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: mode === 'sell' ? '#dc2626' : '#16a34a' }}>
                      {mode === 'sell' ? (sellerData?.credits_balance - tradeAmount) : (buyerData?.credits_balance + tradeAmount)} T
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Partner Account</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{mode === 'sell' ? buyerData?.credits_balance : sellerData?.credits_balance} T</div>
                    <ArrowRightLeft size={14} color="#94a3b8" />
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: mode === 'sell' ? '#16a34a' : '#dc2626' }}>
                      {mode === 'sell' ? ((buyerData?.credits_balance || 0) + tradeAmount) : ((sellerData?.credits_balance || 0) - tradeAmount)} T
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 32, padding: '16px', background: '#1e3a8a' }}>
              {mode === 'sell' ? 'Confirm Sale' : 'Confirm Purchase'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
