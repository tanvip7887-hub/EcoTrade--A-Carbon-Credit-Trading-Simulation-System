import { useState, useEffect } from 'react';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { TrendingUp, Award, BarChart2, Activity, Zap } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', padding: '12px', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(4px)' }}>
        <p style={{ fontWeight: 700, marginBottom: '8px', color: '#fff' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontSize: '0.8rem', color: p.color, margin: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: p.color }}></span>
            {p.name}: <strong>{p.value} T</strong>
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
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}><TrendingUp size={20} /></div>
          <div className="stat-info">
            <div className="stat-label">Market Leader</div>
            <div className="stat-value" style={{ color: '#0f172a' }}>{rankings[0]?.name || '...'}</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}><Award size={20} /></div>
          <div className="stat-info">
            <div className="stat-label">System Status</div>
            <div className="stat-value" style={{ color: '#0f172a' }}>Operational</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="card-title" style={{ color: '#0f172a' }}><BarChart2 size={18} /> Environmental Performance</div>
            <div className="card-subtitle">Detailed comparison of carbon metrics</div>
          </div>
          <div className="pill-tabs">
            <button className={`pill-tab ${activeTab === 'bar' ? 'active' : ''}`} onClick={() => setActiveTab('bar')}>Bar View</button>
            <button className={`pill-tab ${activeTab === 'radar' ? 'active' : ''}`} onClick={() => setActiveTab('radar')}>Radar View</button>
          </div>
        </div>

        <div style={{ height: 450, marginTop: 30 }}>
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'bar' ? (
              <BarChart data={rankings} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 20 }} />
                <Bar dataKey="credits_allocated" name="Allocated" fill="#0f172a" barSize={25} radius={[6, 6, 0, 0]} />
                <Bar dataKey="emissions" name="Emissions" fill="#3b82f6" barSize={25} radius={[6, 6, 0, 0]} />
                <Bar dataKey="credits_balance" name="Balance" fill="#10b981" barSize={25} radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <RadarChart data={rankings} outerRadius="80%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                <Radar name="Emissions" dataKey="emissions" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Radar name="Allocated" dataKey="credits_allocated" stroke="#0f172a" fill="#0f172a" fillOpacity={0.3} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
