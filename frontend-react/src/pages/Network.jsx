import { useState, useEffect } from 'react';
import api from '../api';
import { Share2, Info, Activity } from 'lucide-react';

export default function Network() {
  const [data, setData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/network').then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title"><Share2 size={18} /> Trade Network Graph</div>
            <div className="card-subtitle">Data Structure: Graph (Adjacency Matrix) — Visualizing trade flows</div>
          </div>
        </div>

        {loading ? (
          <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            Generating graph nodes...
          </div>
        ) : (
          <div style={{ height: 400, backgroundColor: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
            {data.nodes.length > 0 ? (
              <div style={{ padding: 40 }}>
                <p style={{ color: '#1e293b', fontWeight: 600, marginBottom: 20 }}>Network Summary:</p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {data.nodes.map(n => (
                    <li key={n.id} style={{ padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}>
                      {n.label} ({n.id})
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 40, padding: 20, backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    <Activity size={14} style={{ display: 'inline', marginRight: 6 }} /> 
                    Found <strong>{data.edges.length} active trade routes</strong> between companies in the network.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                No network data available yet.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-title" style={{ fontSize: '0.88rem' }}><Info size={16} /> How the Graph Works</div>
        <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6, marginTop: 10 }}>
          The backend maps every trade as a <strong>Directed Edge</strong> between company nodes. This allows the system to analyze market connectivity and detect potential carbon credit monopolies.
        </p>
      </div>
    </div>
  );
}
