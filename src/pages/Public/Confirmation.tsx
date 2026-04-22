import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, Hotel, Printer, ArrowRight, Download, Share2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function Confirmation() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { guest, total, checkIn, checkOut } = location.state || {};

  if (!location.state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] p-6">
        <div className="text-center text-slate-500 font-medium">
          <p className="mb-4">Reserva no encontrada o caducada.</p>
          <button onClick={() => navigate('/')} className="text-[10px] font-bold uppercase tracking-widest text-blue-600 border-b-2 border-blue-600">Regresar al Inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans selection:bg-blue-500 selection:text-white flex flex-col items-center py-20 px-6">
      <div className="max-w-2xl w-full">
        <header className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xl tracking-tight">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rotate-45"></div>
              </div>
              <span>LUMINA GRAND</span>
            </div>
            <button onClick={() => window.print()} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-xl transition-all shadow-sm">
              <Printer size={18} />
            </button>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-[3rem] p-10 md:p-16 text-center space-y-10 relative overflow-hidden shadow-2xl shadow-slate-200/50"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-500" />
          
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-500 text-white rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20 rotate-12">
              <CheckCircle size={48} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">¡Reserva Exitosa!</h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em]">Confirmación de Operación Lumina</p>
          </div>

          <div className="py-10 border-y border-slate-100 space-y-4">
             <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Código de Reservación de IA</p>
             <p className="text-6xl font-black tracking-tight text-slate-900 uppercase">
                {id?.slice(-8).toUpperCase()}
             </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-left">
             <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Huésped Titular</p>
                <p className="font-bold text-slate-800">{guest.name}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Transacción Total</p>
                <p className="font-bold text-blue-600">{formatCurrency(total)}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Llegada</p>
                <p className="font-bold text-slate-800">{formatDate(checkIn)}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Salida</p>
                <p className="font-bold text-slate-800">{formatDate(checkOut)}</p>
             </div>
          </div>

          <div className="p-8 bg-slate-900 rounded-[2rem] text-left text-white/80 space-y-4">
             <p className="text-white font-bold flex items-center gap-2 text-sm">
                <Download size={16} className="text-blue-400" /> Itinerario Digital Generado
             </p>
             <p className="text-xs leading-relaxed">
                Se ha enviado el comprobante a <strong>{guest.email}</strong>. 
                Utilice su código único para el check-in automático en los quioscos Lumina.
             </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
             <button className="flex-1 py-5 border border-slate-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <Share2 size={16} /> Compartir
             </button>
             <button 
              onClick={() => navigate('/')}
              className="flex-1 py-5 bg-blue-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
             >
                Regresar al Inicio <ArrowRight size={16} />
             </button>
          </div>
        </motion.div>

        <p className="text-center mt-12 text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
          Lumina Grand Hotel & Residences © 2026
        </p>
      </div>
    </div>
  );
}
