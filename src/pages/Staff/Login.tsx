import { useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../../lib/firebase';
import { LogIn, Key, Shield, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';

export default function StaffLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        const isAdmin = user.email === 'otorml8@gmail.com';
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          name: user.displayName || 'Staff Member',
          role: isAdmin ? 'admin' : 'staff',
          createdAt: serverTimestamp(),
        });
      }
      navigate('/staff/dashboard');
    } catch (err: any) {
      console.error('Detailed Login Error:', err);
      let message = 'Error al iniciar sesión.';
      
      if (err.code === 'auth/popup-blocked') {
        message = 'El navegador bloqueó la ventana emergente. Por favor, permita las ventanas emergentes para este sitio.';
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'El inicio de sesión con Google no está habilitado en la consola de Firebase.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = 'La ventana de inicio de sesión se cerró antes de completar el proceso.';
      } else {
        message = `Error: ${err.message || 'Intente de nuevo.'}`;
      }
      
      setError(message);
      await signOut(auth);
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
              <div className="space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl text-center">
                  {error}
                </div>
                {error.includes('proceso') && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] rounded-xl leading-relaxed">
                    <p className="font-bold mb-2 uppercase tracking-wider">💡 Sugerencia:</p>
                    Si la ventana se cierra sola, intente abrir la aplicación en una <strong>pestaña nueva</strong> (fuera del editor) o verifique que su navegador permita cookies de terceros.
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 bg-white hover:bg-slate-50 text-slate-900 font-bold py-5 rounded-2xl transition-all shadow-xl shadow-white/5 uppercase tracking-[0.2em] text-[10px] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                   <LogIn size={18} className="text-blue-500" />
                   <span>Entrar con Google</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-4 py-2">
               <div className="h-px bg-slate-700/50 flex-1" />
               <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">Seguridad Lumina v2.0</span>
               <div className="h-px bg-slate-700/50 flex-1" />
            </div>

            <p className="text-center text-[10px] text-slate-500 leading-relaxed max-w-[200px] mx-auto font-medium">
               Su actividad será monitoreada y cifrada de extremo a extremo.
            </p>
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
