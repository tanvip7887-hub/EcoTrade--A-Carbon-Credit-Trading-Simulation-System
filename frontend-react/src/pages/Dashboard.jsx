import { useState, useEffect } from 'react';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { TrendingUp, Award, BarChart2, Activity, Zap } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#fff', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <p style={{ fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontSize: '0.85rem', color: p.color, margin: '4px 0' }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [rankings, setRankings] = useState([]);
  const [activeTab, setActiveTab] = useState('bar');

  useEffect(() => {
    api.get('/rankings').then(res => setRankings(res.data)).catch(console.error);
  }, []);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}><TrendingUp size={20} /></div>
          <div className="stat-info">
            <div className="stat-label">Market Leader</div>
            <div className="stat-value">{rankings[0]?.name || '...'}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}><Award size={20} /></div>
          <div className="stat-info">
            <div className="stat-label">Top Eco-Score</div>
            <div className="stat-value">A+</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="card-title"><BarChart2 size={18} /> Environmental Impact Analysis</div>
            <div className="card-subtitle">Emissions vs Allocated Credits per Company</div>
          </div>
          <div className="pill-tabs">
            <button className={`pill-tab ${activeTab === 'bar' ? 'active' : ''}`} onClick={() => setActiveTab('bar')}>Bar Chart</button>
            <button className={`pill-tab ${activeTab === 'radar' ? 'active' : ''}`} onClick={() => setActiveTab('radar')}>Radar Chart</button>
          </div>
        </div>

        <div style={{ height: 400, marginTop: 20 }}>
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'bar' ? (
              <BarChart data={rankings}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="emissions" name="Emissions" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="credits_allocated" name="Allocated" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <RadarChart data={rankings}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Radar name="Credits" dataKey="credits_allocated" stroke="#1e3a8a" fill="#1e3a8a" fillOpacity={0.6} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
