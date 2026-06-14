import { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { Guest, UserProfile } from '../../types';
import Sidebar from '../../components/Sidebar';
import { 
  Search, 
  UserPlus, 
  AlertCircle, 
  History,
  Phone,
  Mail
} from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import { onAuthStateChanged } from 'firebase/auth';

export default function CRM() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const d = await getDoc(doc(db, 'users', fbUser.uid));
        if (d.exists()) setUser(d.data() as UserProfile);
      }
    });

    async function fetchGuests() {
      try {
        const q = query(collection(db, 'guests'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Guest));
        setGuests(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchGuests();
  }, []);

  const filteredGuests = guests.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] font-sans">
      <Sidebar user={user} />
      
      <main className="flex-1 overflow-y-auto">
        <header className="h-24 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">CRM de Huéspedes</h1>
            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest leading-none">Base de Datos Lumina v2.0</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all rounded-xl shadow-lg shadow-blue-500/20">
            <UserPlus size={16} />
            Registrar Huésped
          </button>
        </header>

        <div className="p-8">
          {/* Search & Filters */}
          <div className="mb-10 relative max-w-2xl mx-auto">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
              <Search size={22} />
            </div>
            <input 
              type="text" 
              placeholder="Buscar por nombre, correo electrónico o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-3xl focus:shadow-xl focus:shadow-slate-200/50 outline-none transition-all font-bold text-slate-900 ring-1 ring-slate-200 border-none"
            />
          </div>

          {/* Guest Cards Grid */}
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map(i => (
                   <div key={i} className="h-64 bg-white border border-slate-200 rounded-2xl" />
                ))}
             </div>
          ) : filteredGuests.length === 0 ? (
             <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No se encontraron huéspedes registrados.</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGuests.map((guest) => (
                  <div 
                    key={guest.id}
                    className="bg-white border border-slate-200 p-8 flex flex-col group hover:border-blue-500 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all relative"
                  >
                    {guest.noShowCount > 0 && (
                      <div className="absolute top-6 right-6 flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase rounded-full border border-red-100">
                        <AlertCircle size={10} />
                        Historial No-Show
                      </div>
                    )}

                    <div className="flex items-center gap-5 mb-8">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-xl font-black text-slate-300 shrink-0 uppercase">
                        {guest.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg text-slate-900 truncate pr-16 tracking-tight leading-tight">{guest.name}</h3>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[8px] font-black uppercase text-blue-500 tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">
                            {guest.totalBookings > 5 ? 'Loyalty' : 'Standard'}
                          </span>
                          {guest.totalBookings > 10 && (
                            <span className="text-[8px] font-black uppercase text-amber-500 tracking-widest bg-amber-50 px-2 py-0.5 rounded-full uppercase">VIP</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-10 grow">
                      <div className="flex items-center gap-3 text-slate-500 text-xs font-bold tracking-tight">
                        <Mail size={16} className="text-slate-300" />
                        <span className="truncate">{guest.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 text-xs font-bold tracking-tight">
                        <Phone size={16} className="text-slate-300" />
                        <span>{guest.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 font-black text-[9px] uppercase tracking-widest bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <History size={16} className="text-slate-300" />
                        Última Reserva: <span className="text-slate-600">{guest.lastBookingDate ? formatDate(guest.lastBookingDate) : 'S/R'}</span>
                      </div>
                    </div>

                    <div className="flex border-t border-slate-100 pt-6 mt-auto">
                      <button className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 hover:bg-blue-50 rounded-xl transition-all py-4 border-2 border-blue-50">
                         Detalle de Perfil
                      </button>
                    </div>
                  </div>
                ))}
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
