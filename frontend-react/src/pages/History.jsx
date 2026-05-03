import { useState, useEffect } from 'react';
import api from '../api';
import { History as HistoryIcon, Search, CheckCircle, RotateCcw, ArrowRight } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/history').then(r => {
      setHistory(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = history.filter(h => {
    const matchSearch = !search || h.seller.toLowerCase().includes(search.toLowerCase()) || h.buyer.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || h.type?.toLowerCase() === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="card-title"><HistoryIcon size={18} /> Transaction Logs</div>
            <div className="card-subtitle">Data Structure: Queue (FIFO) — audit trail of all operations</div>
          </div>
          <span className="badge badge-blue">{filtered.length} records</span>
        </div>

        <div className="filter-bar" style={{ display: 'flex', gap: 16, marginBottom: 20, padding: '0 10px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              className="form-control"
              style={{ paddingLeft: 38 }}
              placeholder="Search by company ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="pill-tabs" style={{ marginBottom: 0 }}>
            {['all', 'trade', 'undo'].map(f => (
              <button key={f} className={`pill-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading logs...</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Seller</th>
                  <th>Buyer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((h, i) => (
                  <tr key={i}>
                    <td>
                      {h.type === 'Undo' 
                        ? <span className="badge badge-orange"><RotateCcw size={11} /> Undo</span>
                        : <span className="badge badge-blue"><ArrowRight size={11} /> Trade</span>
                      }
                    </td>
                    <td style={{ fontWeight: 600 }}>{h.seller}</td>
                    <td style={{ fontWeight: 600 }}>{h.buyer}</td>
                    <td><strong>{h.amount}</strong> Credits</td>
                    <td>
                      <span className={`badge ${h.status === 'completed' ? 'badge-green' : 'badge-orange'}`}>
                        {h.status === 'completed' ? <CheckCircle size={11} /> : <RotateCcw size={11} />} {h.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(h.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
