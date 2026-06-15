import { useState } from 'react';
import { LogIn, Key, Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';

export default function StaffLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Llamada directa a nuestro propio backend en Azure
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Guardamos el usuario en el navegador y entramos al sistema
        localStorage.setItem('lumina_user', JSON.stringify(data.usuario));
        navigate('/staff/dashboard');
      } else {
        setError(data.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      console.error('Error de conexión al backend:', err);
      setError('Error al conectar con el servidor. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] font-sans selection:bg-blue-500 selection:text-white p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 text-white font-bold text-3xl tracking-tight mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
              <div className="w-6 h-6 border-4 border-white rotate-45"></div>
            </div>
            <span>LUMINA GESTIÓN</span>
          </div>
          <p className="text-slate-400 font-medium tracking-wide">Acceso Seguro al Panel Operativo</p>
        </div>

        <div className="bg-[#1E293B] border border-slate-700/50 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-8">
            <div className="text-center">
               <h2 className="text-white text-xl font-bold mb-2">Bienvenido de nuevo</h2>
               <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Autenticación de Grado Empresarial</p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-[#0F172A] border border-slate-700 text-white rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                  placeholder="Correo electrónico"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-[#0F172A] border border-slate-700 text-white rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                  placeholder="Contraseña"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-4 bg-white hover:bg-slate-50 text-slate-900 font-bold py-5 rounded-2xl transition-all shadow-xl shadow-white/5 uppercase tracking-[0.2em] text-[10px] disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={18} className="text-blue-500" />
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-4 py-2">
               <div className="h-px bg-slate-700/50 flex-1" />
               <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">Seguridad Lumina v2.0</span>
               <div className="h-px bg-slate-700/50 flex-1" />
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
           <Link to="/" className="text-slate-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Volver a la Web Pública
           </Link>
        </div>
      </motion.div>
    </div>
  );
}