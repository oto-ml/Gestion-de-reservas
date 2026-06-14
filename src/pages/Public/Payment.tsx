import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'motion/react';
import { CreditCard, ShieldCheck, Lock, ChevronLeft, Zap } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { predictCancellation } from '../../services/gemini';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkIn, checkOut, room, guest, total } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [msiAvailable, setMsiAvailable] = useState(false);
  const [selectedMsi, setSelectedMsi] = useState(0);

  useEffect(() => {
    if (!location.state) navigate('/book');
  }, [location.state, navigate]);

  useEffect(() => {
    if (total > 3000 && cardNumber.length >= 6) {
      setMsiAvailable(true);
    } else {
      setMsiAvailable(false);
      setSelectedMsi(0);
    }
  }, [total, cardNumber]);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const historyQ = query(collection(db, 'guests'), where('email', '==', guest.email), limit(5));
      const historySnap = await getDocs(historyQ);
      const history = historySnap.docs.map(d => d.data());
      
      const { probability } = await predictCancellation({ 
        checkIn, 
        checkOut, 
        roomId: room.id 
      }, history);

      let guestId = guest.email.replace(/@|\./g, '_');
      if (historySnap.empty) {
        await addDoc(collection(db, 'guests'), {
          id: guestId,
          ...guest,
          noShowCount: 0,
          totalBookings: 1,
          lastBookingDate: new Date().toISOString(),
          createdAt: serverTimestamp()
        });
      }

      const bookingData = {
        guestId,
        guestName: guest.name,
        guestEmail: guest.email,
        roomId: room.id,
        roomNumber: room.number,
        roomType: room.type,
        checkIn,
        checkOut,
        totalPrice: total,
        status: 'confirmed',
        cancellationProbability: probability || 0.1,
        paymentMethod: 'credit_card',
        lastFour: cardNumber.slice(-4),
        msi: selectedMsi > 0,
        msiMonths: selectedMsi,
        createdAt: serverTimestamp()
      };

      const bookingRef = await addDoc(collection(db, 'bookings'), bookingData);

      navigate(`/confirmation/${bookingRef.id}`, { 
        state: { 
          id: bookingRef.id,
          guest, 
          total, 
          checkIn, 
          checkOut,
          room
        } 
      });
    } catch (error) {
      console.error(error);
      alert('Error al procesar la reserva. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!location.state) return null;

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans">
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <button onClick={() => navigate('/book')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] leading-none">Regresar</span>
          </button>
          
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rotate-45"></div>
             </div>
             <span className="text-slate-900 font-bold text-lg tracking-tight leading-none">LUMINA GRAND</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Lock size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Pago Seguro</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto pt-32 pb-20 px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
           <div className="space-y-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Pasarela de Pago Segura</h1>
              <p className="text-slate-500 font-medium tracking-tight">Sus datos están protegidos por el sistema de seguridad Lumina v2.0.</p>
           </div>

           <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 space-y-10">
              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Número de Tarjeta</label>
                    <div className="relative">
                       <input 
                        type="text" 
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold text-slate-800"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                       />
                       <CreditCard className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Expiración (MM/YY)</label>
                      <input type="text" placeholder="MM/YY" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-slate-800" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">CVC</label>
                      <input type="password" placeholder="***" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-slate-800" />
                    </div>
                 </div>
              </div>

              {msiAvailable && (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-6 relative overflow-hidden"
                >
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                   <div className="flex items-center gap-3 text-blue-400">
                      <Zap size={20} />
                      <h4 className="text-[10px] uppercase font-black tracking-[0.3em]">Meses Sin Intereses Detectados</h4>
                   </div>
                   <div className="grid grid-cols-3 gap-3">
                     {[0, 3, 6, 12].map(m => (
                       <button 
                         key={m}
                         onClick={() => setSelectedMsi(m)}
                         className={cn(
                           "py-4 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                           selectedMsi === m ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20" : "border-slate-800 text-slate-500 hover:border-slate-700"
                         )}
                       >
                         {m === 0 ? 'Contado' : `${m} MSI`}
                       </button>
                     ))}
                   </div>
                </motion.div>
              )}

              <button 
                disabled={loading || cardNumber.length < 16}
                onClick={handlePayment}
                className="w-full py-6 bg-blue-500 text-white font-black uppercase tracking-[0.2em] hover:bg-blue-600 rounded-[1.5rem] shadow-xl shadow-blue-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-4 text-xs"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={20} />
                    <span>Confirmar Reserva Única</span>
                  </>
                )}
              </button>
           </div>
        </div>

        <aside className="space-y-8">
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Resumen de Orden</h3>
              
              <div className="space-y-8">
                 <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold opacity-40 tracking-widest">Habitación</p>
                    <p className="text-xl font-bold font-sans tracking-tight">{room?.type?.toUpperCase()}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                       <p className="text-[10px] uppercase font-bold opacity-40 tracking-widest">Check-In</p>
                       <p className="font-bold text-sm tracking-tight">{checkIn}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] uppercase font-bold opacity-40 tracking-widest">Check-Out</p>
                       <p className="font-bold text-sm tracking-tight">{checkOut}</p>
                    </div>
                 </div>
                 <div className="pt-10 border-t border-white/10 space-y-2">
                    <p className="text-[10px] uppercase font-bold opacity-40 tracking-widest">Monto Total Liquidado</p>
                    <p className="text-4xl font-black tracking-tighter leading-none">{formatCurrency(total)}</p>
                 </div>
              </div>
           </div>

           <div className="bg-white border border-slate-200 p-8 rounded-[2rem] flex items-start gap-4 shadow-sm">
              <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                 <Lock size={24} />
              </div>
              <div className="space-y-2">
                 <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Seguridad Predictiva</h4>
                 <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    Su reserva será validada por nuestro motor de riesgo IA para garantizar su lugar.
                 </p>
              </div>
           </div>
        </aside>
      </main>
    </div>
  );
}
