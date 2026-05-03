import { useState, useEffect } from 'react';
import api from '../api';
import { History as HistoryIcon, Search, CheckCircle, RotateCcw, Filter, ArrowRightLeft } from 'lucide-react';

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
        <div className="card-header">
          <div>
            <div className="card-title"><HistoryIcon size={18} /> Transaction Logs</div>
            <div className="card-subtitle">Data Structure: Queue (FIFO) — most recent trades appear first</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
              {filtered.length} records
            </span>
          </div>
        </div>

        <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
              placeholder="Search by company ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="pill-tabs" style={{ marginBottom: 0, background: '#f8fafc', padding: '4px', borderRadius: '10px' }}>
            {['all', 'trade', 'undo'].map(f => (
              <button key={f} className={`pill-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>Loading history...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <HistoryIcon size={40} style={{ marginBottom: 16, opacity: 0.5 }} />
            <h3 style={{ margin: 0, color: '#64748b' }}>No Records Found</h3>
            <p style={{ fontSize: '0.9rem' }}>No trade history matches your current search or filter.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Type</th>
                  <th>Seller ID</th>
                  <th>Buyer ID</th>
                  <th>Amount (Credits)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((h, i) => (
                  <tr key={i}>
                    <td style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{i + 1}</td>
                    <td>
                      {h.type === 'Undo'
                        ? <span style={{ backgroundColor: '#fff7ed', color: '#c2410c', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <RotateCcw size={10} /> UNDO
                          </span>
                        : <span style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <ArrowRightLeft size={10} /> TRADE
                          </span>
                      }
                    </td>
                    <td style={{ fontWeight: 600 }}>{h.seller}</td>
                    <td style={{ fontWeight: 600 }}>{h.buyer}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{h.amount} CR</td>
                    <td>
                      <span style={{ 
                        backgroundColor: h.status === 'completed' ? '#f0fdf4' : '#fff7ed', 
                        color: h.status === 'completed' ? '#16a34a' : '#c2410c',
                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                        display: 'inline-flex', alignItems: 'center', gap: 4
                      }}>
                        <CheckCircle size={10} /> {h.status.toUpperCase()}
                      </span>
                    </td>
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
