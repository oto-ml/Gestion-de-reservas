import { Link } from 'react-router-dom';
import { Hotel, ArrowRight, Mail, Phone, MapPin, ChevronRight, Star } from 'lucide-react';
import { motion } from 'motion/react';

export default function PublicHome() {
  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans selection:bg-blue-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rotate-45"></div>
            </div>
            <span>LUMINA GRAND</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-[10px] uppercase font-bold tracking-widest text-slate-500">
             <a href="#rooms" className="hover:text-blue-600 transition-colors">Habitaciones</a>
             <a href="#services" className="hover:text-blue-600 transition-colors">Experiencias</a>
             <a href="/staff/login" className="hover:text-blue-600 transition-colors">Acceso Staff</a>
          </div>
          <Link 
            to="/book" 
            className="px-6 py-3 bg-blue-500 text-white text-[10px] uppercase font-bold tracking-widest hover:bg-blue-600 transition-all rounded-xl shadow-lg shadow-blue-500/20"
          >
            Reservar Ahora
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-12 items-center">
          <div className="col-span-12 lg:col-span-6 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-[0.2em]">Exclusividad & IA</span>
              <h1 className="text-6xl md:text-7xl font-sans font-black text-slate-900 mb-8 leading-[1.1] tracking-tight mt-6">
                Rediseñando la <br /><span className="text-blue-500 font-serif italic font-normal">Estancia</span> Perfecta.
              </h1>
              <p className="text-lg text-slate-500 max-w-lg leading-relaxed font-medium mb-10">
                Bienvenido a Lumina Grand, donde la hospitalidad tradicional se encuentra con la precisión de la inteligencia artificial para ofrecerle una experiencia sin precedentes.
              </p>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Link 
                  to="/book" 
                  className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white font-bold uppercase tracking-widest hover:bg-slate-800 transition-all text-xs rounded-2xl flex items-center justify-center gap-2"
                >
                  Comenzar Reserva
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="col-span-12 lg:col-span-6 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-[4/5] bg-slate-200 rounded-[3rem] overflow-hidden shadow-2xl relative group"
            >
               <img 
                  src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080&auto=format&fit=crop" 
                  alt="Luxury Hotel"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
               <div className="absolute bottom-10 left-10 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Suites Premium</p>
                  <p className="text-2xl font-bold">Residencias de Altura</p>
               </div>
            </motion.div>
            
            {/* Floating Geometric Element */}
            <div className="absolute -bottom-6 -left-6 bg-blue-500 p-8 rounded-[2rem] shadow-xl hidden md:block">
               <div className="w-12 h-12 border-4 border-white rounded-xl mb-4 rotate-12 flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-sm" />
               </div>
               <p className="text-white font-bold text-xl leading-tight">100%<br />Controlado</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="rooms" className="py-32 px-8 max-w-7xl mx-auto">
         <div className="mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Nuestras suites</h2>
            <div className="w-20 h-1.5 bg-blue-500 rounded-full" />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { type: 'Standard Suite', price: '$2,500', img: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800', desc: 'Confort minimalista y vistas urbanas.' },
              { type: 'Executive Deluxe', price: '$4,200', img: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800', desc: 'Espacio ampliado con tecnologías inteligentes.' },
              { type: 'Grand Reserve Suite', price: '$8,900', img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800', desc: 'Nuestra joya exclusiva con mayordomo digital.' },
            ].map((room, i) => (
              <Link
                to="/book"
                key={room.type}
                className="group block"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 relative border border-slate-200">
                    <img src={room.img} alt={room.type} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-6 left-6 text-white bg-slate-900/40 backdrop-blur-sm p-3 rounded-xl border border-white/20">
                      <p className="text-[10px] uppercase font-bold tracking-widest mb-1 opacity-80">Desde</p>
                      <p className="text-2xl font-bold">{room.price}</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 truncate group-hover:text-blue-500 transition-colors">{room.type}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium mb-4">{room.desc}</p>
                </motion.div>
              </Link>
            ))}
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-20 px-8 border-t border-slate-200">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xl tracking-tight grayscale opacity-40">
              <div className="w-6 h-6 border-2 border-slate-900 rotate-45" />
              <span>LUMINA GRAND</span>
            </div>
            <div className="flex gap-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">
               <a href="#" className="hover:text-blue-600 transition-colors">Privacidad</a>
               <a href="#" className="hover:text-blue-600 transition-colors">Términos</a>
               <a href="#" className="hover:text-blue-600 transition-colors">Contacto</a>
            </div>
            <p className="text-[10px] font-bold text-slate-400">© 2024 GR AI SYSTEMS</p>
         </div>
      </footer>
    </div>
  );
}
