import { useState, useEffect } from 'react';
import api from '../api';
import { Repeat, CheckCircle, AlertCircle, Info, ArrowRight, Wallet, Activity } from 'lucide-react';

export default function Trading() {
  const [companies, setCompanies] = useState([]);
  const [sellerId, setSellerId] = useState('');
  const [buyerId, setBuyerId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tradeType, setTradeType] = useState('sell'); // 'sell' or 'buy'
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.get('/companies').then(res => setCompanies(res.data)).catch(console.error);
    if (user.role === 'company') {
      if (tradeType === 'sell') setSellerId(user.company_id);
      else setBuyerId(user.company_id);
    }
  }, [message, tradeType]);

  const handleTrade = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      await api.post('/trade', { seller_id: sellerId, buyer_id: buyerId, amount: parseFloat(amount) });
      setMessage(`Successfully transferred ${amount} credits!`);
      setAmount('');
    } catch (err) { setError(err.response?.data?.error || 'Trade failed.'); }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header"><Repeat size={18} /> Execute Carbon Credit Trade</div>
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
            <label className="form-label">Amount of Credits</label>
            <input type="number" className="form-control" value={amount} onChange={e => setAmount(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 20 }}>Execute Trade</button>
        </form>
      </div>
    </div>
  );
}
