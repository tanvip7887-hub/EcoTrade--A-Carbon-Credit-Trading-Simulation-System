import { useState, useEffect } from 'react';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { Building2, ArrowRightLeft, Award, Zap, BarChart2, TrendingUp, ShieldCheck } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <p style={{ fontWeight: 700, marginBottom: '8px', color: '#1e3a8a' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontSize: '0.8rem', color: p.color, margin: '4px 0', fontWeight: 600 }}>
            {p.name}: {p.value} T
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard({ user }) {
  const [allRankings, setAllRankings] = useState([]);
  const [stats, setStats] = useState({ total_companies: 0, total_trades: 0, top_company: '...', total_emissions: 0 });
  const [activeTab, setActiveTab] = useState('bar');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rankRes, statsRes] = await Promise.all([
        api.get('/rankings'),
        api.get('/stats')
      ]);
      setAllRankings(rankRes.data);
      setStats(statsRes.data);
    } catch (e) { console.error(e); }
  };

  // Filter rankings for company view if needed
  const displayData = user.role === 'admin' ? allRankings : allRankings.filter(c => c.company_id === user.id);
  const myCompanyData = allRankings.find(c => c.company_id === user.id) || {};

  const statItems = user.role === 'admin' ? [
    { label: 'Registered Companies', value: stats.total_companies, sub: 'Stored in Hash Table', icon: Building2, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Total Trades', value: stats.total_trades, sub: 'Logged in Queue', icon: ArrowRightLeft, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Top Eco Company', value: stats.top_company, sub: 'Ranked by AVL Tree', icon: Award, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Total Emissions (T)', value: stats.total_emissions, sub: 'Across all companies', icon: Zap, color: '#8b5cf6', bg: '#f5f3ff' },
  ] : [
    { label: 'Your Emissions', value: myCompanyData.emissions || 0, sub: 'Actual Carbon Output', icon: Zap, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Credit Balance', value: myCompanyData.credits_balance || 0, sub: 'Available to Trade', icon: TrendingUp, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Market Standing', value: myCompanyData.eco_score >= 80 ? 'Excellent' : 'Needs Review', sub: 'Eco-Score Ranking', icon: ShieldCheck, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Total Allocation', value: myCompanyData.credits_allocated || 0, sub: 'Assigned by Government', icon: Building2, color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {statItems.map((item, i) => (
          <div key={i} className="stat-card" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
            <div style={{ backgroundColor: item.bg, color: item.color, padding: '12px', borderRadius: '12px' }}>
              <item.icon size={24} />
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>{item.label}</div>
              <div style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: 800, margin: '2px 0' }}>{item.value}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div className="card-title" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={20} /> {user.role === 'admin' ? 'Market Impact Analysis' : 'Your Environmental Performance'}
            </div>
            <div className="card-subtitle" style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {user.role === 'admin' ? 'System-wide emissions vs credits' : `Detailed breakdown for ${user.name}`}
            </div>
          </div>
          <div className="pill-tabs" style={{ background: '#f8fafc', padding: '4px', borderRadius: '10px' }}>
            <button className={`pill-tab ${activeTab === 'bar' ? 'active' : ''}`} onClick={() => setActiveTab('bar')}>Bar View</button>
            <button className={`pill-tab ${activeTab === 'radar' ? 'active' : ''}`} onClick={() => setActiveTab('radar')}>Radar View</button>
          </div>
        </div>

        <div style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'bar' ? (
              <BarChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ paddingTop: '30px' }} 
                  formatter={(value) => <span style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>{value}</span>}
                />
                <Bar dataKey="credits_allocated" name="Allocated" fill="#1e3a8a" barSize={15} radius={[4, 4, 0, 0]} />
                <Bar dataKey="credits_balance" name="Balance" fill="#0ea5e9" barSize={15} radius={[4, 4, 0, 0]} />
                <Bar dataKey="emissions" name="Emissions" fill="#3b82f6" barSize={15} radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <RadarChart data={displayData} outerRadius="80%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                <Radar name="Emissions" dataKey="emissions" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Radar name="Allocated" dataKey="credits_allocated" stroke="#1e3a8a" fill="#1e3a8a" fillOpacity={0.3} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>{value}</span>} />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
