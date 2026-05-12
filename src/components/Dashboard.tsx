import { HistoryItem } from '../hooks/useHistory';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, TrendingUp } from 'lucide-react';
import { Language } from '../services/aiService';

interface Props {
  history: HistoryItem[];
  language: Language;
}

const TRANSLATIONS = {
  en: { title: "Farm Dashboard", empty: "No data to show yet.", total: "Total Scans", healthy: "Healthy", issues: "Issues Detected" },
  sw: { title: "Dashibodi ya Shamba", empty: "Hakuna data bado.", total: "Jumla ya Skana", healthy: "Zenye Afya", issues: "Matatizo" },
  rw: { title: "Imibare y'Umurima", empty: "Nta makuru arahagera.", total: "Zose Zasuzumwe", healthy: "Nta kibazo", issues: "Ibibazo Byabonetse" },
  fr: { title: "Tableau de Bord", empty: "Aucune donnée pour l'instant.", total: "Total des Analyses", healthy: "Sain", issues: "Problèmes Détectés" }
};

export function Dashboard({ history, language }: Props) {
  const t = TRANSLATIONS[language];

  if (history.length === 0) {
    return null;
  }

  // Aggregate data by month for the chart
  const dataMap: Record<string, number> = {};
  let issuesCount = 0;
  let healthyCount = 0;

  history.forEach(h => {
    const d = new Date(h.date);
    const month = d.toLocaleString('default', { month: 'short' });
    dataMap[month] = (dataMap[month] || 0) + 1;

    const isHealthy = h.result.severity?.toLowerCase() === 'low' || h.result.disease?.toLowerCase().includes('healthy');
    if (isHealthy) healthyCount++;
    else issuesCount++;
  });

  const chartData = Object.keys(dataMap).map(key => ({
    name: key,
    scans: dataMap[key]
  })).reverse(); // Oldest first

  return (
    <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-brand-100 shadow-xl shadow-brand-900/5 mb-8">
      <h3 className="text-2xl font-bold text-brand-950 mb-6 flex items-center gap-2">
        <LayoutDashboard className="text-brand-600" />
        {t.title}
      </h3>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-brand-50/50 p-4 rounded-2xl text-center border border-brand-50">
          <p className="text-3xl font-bold text-brand-900">{history.length}</p>
          <p className="text-xs uppercase font-bold text-brand-900/50 mt-1">{t.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-2xl text-center border border-green-100">
          <p className="text-3xl font-bold text-green-700">{healthyCount}</p>
          <p className="text-xs uppercase font-bold text-green-700/50 mt-1">{t.healthy}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-2xl text-center border border-orange-100">
          <p className="text-3xl font-bold text-orange-700">{issuesCount}</p>
          <p className="text-xs uppercase font-bold text-orange-700/50 mt-1">{t.issues}</p>
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#777', fontSize: 12 }} />
            <YAxis hide />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            />
            <Bar dataKey="scans" fill="#14B8A6" radius={[4, 4, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm font-bold text-brand-900/50 justify-center">
        <TrendingUp size={16} />
        Scan Trends
      </div>
    </div>
  );
}
