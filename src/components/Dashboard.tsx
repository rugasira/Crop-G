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
    <div className="bg-[#0A1F17] rounded-[2rem] p-6 sm:p-8 border border-[#10B981]/15 shadow-[0_0_40px_rgba(16,185,129,0.05)] mb-8">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <LayoutDashboard className="text-[#10B981]" />
        {t.title}
      </h3>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0F2E22] p-4 rounded-2xl text-center border border-[#10B981]/20">
          <p className="text-3xl font-bold text-white">{history.length}</p>
          <p className="text-xs uppercase font-bold text-[#6EE7B7] mt-1">{t.total}</p>
        </div>
        <div className="bg-[#10B981]/10 p-4 rounded-2xl text-center border border-[#10B981]/20">
          <p className="text-3xl font-bold text-[#10B981]">{healthyCount}</p>
          <p className="text-xs uppercase font-bold text-[#D1FAE5] mt-1">{t.healthy}</p>
        </div>
        <div className="bg-[#F59E0B]/10 p-4 rounded-2xl text-center border border-[#F59E0B]/20">
          <p className="text-3xl font-bold text-[#F59E0B]">{issuesCount}</p>
          <p className="text-xs uppercase font-bold text-[#FCD34D] mt-1">{t.issues}</p>
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#777', fontSize: 12 }} />
            <YAxis hide />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ borderRadius: '1rem', border: '1px solid rgba(16,185,129,0.2)', backgroundColor: '#0F2E22', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
            />
            <Bar dataKey="scans" fill="#10B981" radius={[4, 4, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm font-bold text-[#6EE7B7] justify-center">
        <TrendingUp size={16} />
        Scan Trends
      </div>
    </div>
  );
}
