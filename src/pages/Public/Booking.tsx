import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Room, Booking } from '../../types';
import { motion } from 'motion/react';
import { Hotel, Calendar, User, Search, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { predictCancellation } from '../../services/gemini';

export default function PublicBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Selection state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [guestData, setGuestData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    async function fetchRooms() {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'rooms'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
      if (data.length === 0) {
        setRooms([
          { id: '1', number: '101', type: 'standard', price: 2500, status: 'available' },
          { id: '2', number: '202', type: 'deluxe', price: 4200, status: 'available' },
          { id: '3', number: '303', type: 'suite', price: 8900, status: 'available' },
        ]);
      } else {
        setRooms(data.filter(r => r.status === 'available'));
      }
      setLoading(false);
    }
    fetchRooms();
  }, []);

  const handleNextStep = () => setStep(s => s + 1);
  const handlePrevStep = () => setStep(s => s - 1);

  const calculateTotal = () => {
    if (!checkIn || !checkOut || !selectedRoom) return 0;
    const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days * selectedRoom.price : 0;
  };

  const handleSubmit = () => {
    navigate('/payment', { 
      state: { 
        checkIn, 
        checkOut, 
        room: selectedRoom, 
        guest: guestData,
        total: calculateTotal()
      } 
    });
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans">
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-900 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rotate-45"></div>
            </div>
            <span>LUMINA GRAND</span>
          </button>
          
          <div className="hidden md:flex gap-6 items-center">
             {[
               { n: 1, l: 'Fechas' },
               { n: 2, l: 'Habitación' },
               { n: 3, l: 'Información' }
             ].map(s => (
               <div key={s.n} className={cn(
                 "flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.2em] transition-all",
                 step >= s.n ? "text-blue-600" : "text-slate-300"
               )}>
                 <div className={cn(
                   "w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all",
                   step >= s.n ? "border-blue-500 bg-blue-500 text-white" : "border-slate-200 text-slate-300"
                 )}>{s.n}</div>
               </div>
             ))}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pt-32 pb-20 px-6">
        <motion.div
           key={step}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden"
        >
          {step === 1 && (
            <div className="p-10 md:p-14 space-y-10">
               <div className="space-y-2">
                 <h2 className="text-4xl font-black text-slate-900 tracking-tight">Seleccione su Estancia</h2>
                 <p className="text-slate-500 font-medium">Elija las fechas para validar disponibilidad en tiempo real.</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] ml-1">Llegada (Check-In)</label>
                    <input 
                      type="date" 
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold text-slate-800" 
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] ml-1">Salida (Check-Out)</label>
                    <input 
                      type="date" 
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold text-slate-800" 
                      min={checkIn || new Date().toISOString().split('T')[0]}
                    />
                  </div>
               </div>
               <button 
                disabled={!checkIn || !checkOut}
                onClick={handleNextStep}
                className="w-full py-5 bg-blue-500 text-white font-bold uppercase tracking-[0.2em] hover:bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all text-xs"
               >
                 Ver Habitaciones Disponibles
               </button>
            </div>
          )}

          {step === 2 && (
            <div className="p-10 md:p-14">
               <div className="flex justify-between items-end mb-10">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Elija su Habitación</h2>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">IA VALIDADA</span>
               </div>
               
               <div className="space-y-4 mb-10">
                  {rooms.map((room) => (
                    <div 
                      key={room.id}
                      onClick={() => {
                        setSelectedRoom(room);
                        handleNextStep();
                      }}
                      className={cn(
                        "p-8 border-2 rounded-[2rem] transition-all cursor-pointer group flex justify-between items-center",
                        selectedRoom?.id === room.id ? "border-blue-500 bg-blue-50" : "border-slate-100 hover:border-slate-200 bg-white"
                      )}
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200 group-hover:bg-white transition-colors">
                           <Hotel className="text-slate-400" size={28} />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">{room.type}</p>
                           <h3 className="text-xl font-bold text-slate-800">Habitación {room.number}</h3>
                           <div className="flex gap-3 mt-2">
                             <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                             <span className="text-[9px] uppercase font-bold text-slate-400">Totalmente Equipada</span>
                           </div>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-black text-slate-900">{formatCurrency(room.price)}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">por noche</p>
                      </div>
                    </div>
                  ))}
               </div>
               
               <div className="flex gap-4">
                  <button onClick={handlePrevStep} className="px-10 py-5 border border-slate-200 text-slate-400 font-bold uppercase tracking-widest hover:bg-slate-50 transition-all rounded-2xl text-[10px]">Atrás</button>
                  <button 
                    disabled={!selectedRoom}
                    onClick={handleNextStep}
                    className="flex-1 py-5 bg-blue-500 text-white font-bold uppercase tracking-widest hover:bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all text-xs"
                  >
                    Siguiente: Resumen
                  </button>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-10 md:p-14">
               <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-10">Confirme sus Datos</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] ml-1">Nombre Completo</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Juan Pérez"
                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-slate-800"
                        value={guestData.name}
                        onChange={(e) => setGuestData({ ...guestData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] ml-1">Email Corporativo / Personal</label>
                      <input 
                        type="email" 
                        placeholder="juan@ejemplo.com"
                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-slate-800"
                        value={guestData.email}
                        onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden flex flex-col justify-between">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
                     <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 mb-6">Su Estancia</p>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center text-sm">
                              <span className="opacity-60">{selectedRoom?.type} x {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} noches</span>
                              <span className="font-bold">{formatCurrency(calculateTotal())}</span>
                           </div>
                        </div>
                     </div>
                     <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex justify-between items-end">
                        <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Total Lumina</span>
                        <span className="text-3xl font-black">{formatCurrency(calculateTotal())}</span>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4">
                  <button onClick={handlePrevStep} className="px-10 py-5 border border-slate-200 text-slate-400 font-bold uppercase tracking-widest hover:bg-slate-50 transition-all rounded-2xl text-[10px]">Atrás</button>
                  <button 
                    disabled={!guestData.name || !guestData.email}
                    onClick={handleSubmit}
                    className="flex-1 py-5 bg-blue-500 text-white font-bold uppercase tracking-widest hover:bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all text-xs"
                  >
                    Proceder al Pago Seguro
                  </button>
               </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
