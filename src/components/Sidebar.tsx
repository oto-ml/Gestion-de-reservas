import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  LogOut, 
  Calendar,
  Settings,
  Hotel
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';

export default function Sidebar({ user }: { user: UserProfile }) {
  const location = useLocation();

  const navItems = [
    { label: 'Panel Central', icon: LayoutDashboard, href: '/staff/dashboard' },
    { label: 'CRM de Huéspedes', icon: Users, href: '/staff/crm' },
    { label: 'Gestión Staff', icon: ShieldCheck, href: '/staff/admin', adminOnly: true },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 bg-[#0F172A] text-slate-300 flex flex-col border-r border-slate-200">
      <div className="p-6 mb-4">
        <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <span>LUMINA GESTIÓN</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          if (item.adminOnly && user.role !== 'admin') return null;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                isActive 
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
                  : "hover:bg-slate-800 text-slate-400 hover:text-slate-100"
              )}
            >
              <item.icon size={18} className={isActive ? "text-blue-400" : "group-hover:text-slate-100"} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-800 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-blue-400 flex items-center justify-center overflow-hidden">
             <span className="text-white text-xs font-bold uppercase">{user.name.charAt(0)}</span>
          </div>
          <div>
            <p className="text-xs font-bold text-white">{user.name}</p>
            <p className="text-[10px] opacity-50 uppercase tracking-widest">{user.role}</p>
          </div>
        </div>
        
        <button 
          onClick={() => signOut(auth)}
          className="mt-4 w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all text-xs"
        >
          <LogOut size={14} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
