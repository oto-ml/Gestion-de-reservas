import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile, Booking, HistoricPattern } from '../../types';
import Sidebar from '../../components/Sidebar';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  CalendarCheck,
  Brain
} from 'lucide-react';
import { identifyDemandPatterns } from '../../services/gemini';
import { motion } from 'motion/react';
import { formatCurrency } from '../../lib/utils';

export default function Dashboard({ user }: { user: UserProfile }) {
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<HistoricPattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(10));
        const snapshot = await getDocs(q);
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        setRecentBookings(bookings);

        const patterns = await identifyDemandPatterns(bookings);
        if (patterns.length > 0) {
          setStats(patterns);
        } else {
          setStats([
            { month: 'LUN', bookings: 45, occupancy: 65, cancelRate: 12 },
            { month: 'MAR', bookings: 52, occupancy: 70, cancelRate: 8 },
            { month: 'MIE', bookings: 85, occupancy: 68, cancelRate: 15 },
            { month: 'JUE', bookings: 61, occupancy: 82, cancelRate: 5 },
            { month: 'VIE', bookings: 95, occupancy: 90, cancelRate: 4 },
            { month: 'SAB', bookings: 70, occupancy: 75, cancelRate: 6 },
            { month: 'DOM', bookings: 30, occupancy: 40, cancelRate: 2 },
          ]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <Sidebar user={user} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Sistema de Control de Reservas e Inteligencia de Demanda</h2>
          <div className="flex gap-4">
            <div className="bg-slate-100 rounded-lg px-4 py-2 flex items-center gap-2 border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Sistema Activo</span>
            </div>
          </div>
        </header>

        <div className="p-8 overflow-y-auto">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Main Chart Section */}
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2 uppercase text-xs tracking-wider">
                    <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                    Histórico de Reservas & Predicción de Cancelación
                  </h3>
                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">ACTUALIZADO EN TIEMPO REAL</span>
                </div>
                
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats}>
                      <defs>
                        <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#64748B', fontWeight: 'bold' }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#64748B' }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="bookings" 
                        stroke="#3B82F6" 
                        fillOpacity={1} 
                        fill="url(#colorBlue)" 
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4 border-t pt-6 border-slate-100">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Prob. Cancelación</p>
                    <p className="text-3xl font-bold text-red-500">14.2%</p>
                  </div>
                  <div className="text-center border-x border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Demanda Proyectada</p>
                    <p className="text-3xl font-bold text-blue-600">Alta (+12%)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Conversión MSI</p>
                    <p className="text-3xl font-bold text-slate-800">64%</p>
                  </div>
                </div>
              </section>

              {/* Table Section */}
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
                <h3 className="font-bold text-slate-700 mb-6 uppercase text-xs tracking-wider">CRM: Panel de Control de Huéspedes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100">
                      <tr className="h-10">
                        <th className="pb-2">Huésped / ID</th>
                        <th className="pb-2">Check-In</th>
                        <th className="pb-2">Estado Histórico</th>
                        <th className="pb-2">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-medium">
                      {recentBookings.map((booking) => (
                        <tr key={booking.id} className="h-14 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="py-3">
                            <p className="font-bold text-slate-800">{booking.guestName || 'Invitado'}</p>
                            <p className="text-[10px] opacity-50 uppercase tracking-tighter">#{booking.id.slice(-8).toUpperCase()}</p>
                          </td>
                          <td className="py-3 text-slate-600 font-mono">{new Date(booking.checkIn).toLocaleDateString()}</td>
                          <td className="py-3">
                            <span className={cn(
                              "px-2 py-1 rounded-lg font-bold text-[9px] uppercase tracking-tighter",
                              booking.cancellationProbability > 0.5 
                                ? "bg-red-100 text-red-600" 
                                : "bg-green-100 text-green-600"
                            )}>
                              {booking.cancellationProbability > 0.5 ? 'Riesgo Alto' : 'Validado IA'}
                            </span>
                          </td>
                          <td className="py-3">
                            <button className="text-blue-600 font-bold hover:underline transition-all">Ver Perfil</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Sidebar Column */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <section className="bg-slate-900 text-white rounded-2xl p-8 shadow-lg relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl opacity-50"></div>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Brain size={18} className="text-blue-400" />
                  Smart Insight
                </h3>
                <div className="space-y-6">
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    "Patrón detectado: Las reservas con American Express muestran un 15% menos de probabilidad de cancelación este mes."
                  </p>
                  <button className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-xs uppercase tracking-widest">
                    Ajustar Tarifas Dinámicas
                  </button>
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col h-full min-h-[300px]">
                <h3 className="font-bold text-slate-700 mb-6 uppercase text-xs tracking-wider">Última Confirmación</h3>
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center mb-8">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Código de Reserva</p>
                  <p className="text-3xl font-mono font-black text-slate-800 tracking-[0.1em]">
                    {recentBookings.length > 0 ? recentBookings[0].id.slice(-8).toUpperCase() : '---'}
                  </p>
                </div>
                <div className="space-y-4 text-[11px] mt-auto">
                  <div className="flex justify-between border-b border-slate-50 pb-2 text-slate-500 font-bold uppercase tracking-tighter">
                    <span>Huésped</span>
                    <span className="text-slate-800 truncate max-w-[120px]">{recentBookings.length > 0 ? recentBookings[0].guestName : '---'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2 text-slate-500 font-bold uppercase tracking-tighter">
                    <span>Estado de Pago</span>
                    <span className="text-green-600">Completado</span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-bold uppercase tracking-tighter">
                    <span>Staff Asignado</span>
                    <span className="text-slate-800">{user.name.split(' ')[0]}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


// Helper components & utils
import { cn } from '../../lib/utils';
