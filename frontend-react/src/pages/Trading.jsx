import { useState, useEffect } from 'react';
import api from '../api';
import { Repeat, CheckCircle, AlertCircle, Info, RotateCcw } from 'lucide-react';

export default function Trading() {
  const [companies, setCompanies] = useState([]);
  const [sellerId, setSellerId] = useState('');
  const [buyerId, setBuyerId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tradeType, setTradeType] = useState('sell');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchData();
  }, [message, tradeType]);

  const fetchData = async () => {
    try {
      const res = await api.get('/companies');
      setCompanies(res.data);
      if (user.role === 'company') {
        if (tradeType === 'sell') setSellerId(user.company_id);
        else setBuyerId(user.company_id);
      }
    } catch (e) { console.error(e); }
  };

  const handleTrade = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      await api.post('/trade', { seller_id: sellerId, buyer_id: buyerId, amount: parseFloat(amount) });
      setMessage(`Successfully transferred ${amount} credits!`);
      setAmount('');
    } catch (err) { setError(err.response?.data?.error || 'Trade failed.'); }
  };

  const handleUndo = async () => {
    setMessage(''); setError('');
    try {
      const res = await api.post('/trade/undo');
      setMessage(res.data.message);
      fetchData();
    } catch (err) { setError(err.response?.data?.error || 'Undo failed.'); }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Repeat size={18} /> Execute Carbon Credit Trade
          </div>
          {user.role === 'admin' && (
            <button className="btn btn-secondary btn-sm" onClick={handleUndo} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <RotateCcw size={14} /> Undo Last Trade
            </button>
          )}
        </div>

        {user.role === 'company' && (
          <div className="pill-tabs" style={{ marginBottom: 20 }}>
            <button className={`pill-tab ${tradeType === 'sell' ? 'active' : ''}`} onClick={() => setTradeType('sell')}>Sell Credits</button>
            <button className={`pill-tab ${tradeType === 'buy' ? 'active' : ''}`} onClick={() => setTradeType('buy')}>Buy Credits</button>
          </div>
        )}

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleTrade}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Seller Company</label>
              <select className="form-control" value={sellerId} onChange={e => setSellerId(e.target.value)} disabled={user.role === 'company' && tradeType === 'sell'}>
                <option value="">Select seller...</option>
                {companies.map(c => <option key={c.company_id} value={c.company_id}>{c.name} (Bal: {c.credits_balance})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Buyer Company</label>
              <select className="form-control" value={buyerId} onChange={e => setBuyerId(e.target.value)} disabled={user.role === 'company' && tradeType === 'buy'}>
                <option value="">Select buyer...</option>
                {companies.map(c => <option key={c.company_id} value={c.company_id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Amount of Credits to Transfer</label>
            <input type="number" className="form-control" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 100" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 20 }}>Execute Trade</button>
        </form>
      </div>
      
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-title" style={{ fontSize: '0.88rem' }}><Info size={16} /> Data Structure Insight</div>
        <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6, marginTop: 10 }}>
          This trading engine uses a <strong>Stack (LIFO)</strong> for undo operations and a <strong>Queue (FIFO)</strong> for transaction logging, ensuring every trade is recorded and reversible.
        </p>
      </div>
    </div>
  );
}
