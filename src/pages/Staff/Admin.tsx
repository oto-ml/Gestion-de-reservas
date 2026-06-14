import { useEffect, useState } from 'react';
import { collection, query, getDocs, updateDoc, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { UserProfile } from '../../types';
import Sidebar from '../../components/Sidebar';
import { 
  ShieldCheck, 
  UserCog, 
  Mail,
  Calendar,
  Lock,
  Unlock,
  ChevronRight
} from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import { onAuthStateChanged } from 'firebase/auth';

export default function Admin() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const d = await getDoc(doc(db, 'users', fbUser.uid));
        if (d.exists()) setCurrentUser(d.data() as UserProfile);
      }
    });

    async function fetchUsers() {
      try {
        const q = query(collection(db, 'users'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data() as UserProfile);
        setUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleRoleToggle = async (uid: string, currentRole: string) => {
    if (uid === currentUser?.uid) return alert('No puedes cambiar tu propio rol.');
    const newRole = currentRole === 'admin' ? 'staff' : 'admin';
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole as any } : u));
    } catch (error) {
      console.error(error);
      alert('Error updating role');
    }
  };

  const handleSeedData = async () => {
    setLoading(true);
    try {
      // Seed Rooms
      const rooms = [
        { id: 'R101', number: '101', type: 'standard', price: 2500, status: 'available' },
        { id: 'R102', number: '102', type: 'standard', price: 2500, status: 'available' },
        { id: 'R201', number: '201', type: 'deluxe', price: 4200, status: 'available' },
        { id: 'R202', number: '202', type: 'deluxe', price: 4200, status: 'occupied' },
        { id: 'R301', number: '301', type: 'suite', price: 8900, status: 'available' },
      ];
      for (const r of rooms) {
        await setDoc(doc(db, 'rooms', r.id), r);
      }

      // Seed Guests
      const guests = [
        { id: 'g_juan', name: 'Juan Pérez', email: 'juan@test.com', phone: '5511223344', noShowCount: 0, totalBookings: 3, lastBookingDate: '2026-04-10T10:00:00Z' },
        { id: 'g_maria', name: 'Maria Lopez', email: 'maria@test.com', phone: '5500998877', noShowCount: 2, totalBookings: 1, lastBookingDate: '2026-03-01T15:30:00Z' },
      ];
      for (const g of guests) {
        await setDoc(doc(db, 'guests', g.id), g);
      }

      // Seed some Bookings for charts
      const bookings = [
        { id: 'b1', guestId: 'g_juan', guestName: 'Juan Pérez', roomId: 'R201', checkIn: '2026-04-20', checkOut: '2026-04-25', totalPrice: 21000, status: 'confirmed', cancellationProbability: 0.05, createdAt: new Date('2026-04-15').toISOString() },
        { id: 'b2', guestId: 'g_maria', guestName: 'Maria Lopez', roomId: 'R101', checkIn: '2026-04-22', checkOut: '2026-04-23', totalPrice: 2500, status: 'pending', cancellationProbability: 0.85, createdAt: new Date().toISOString() },
      ];
      for (const b of bookings) {
        await setDoc(doc(db, 'bookings', b.id), b);
      }
      
      alert('Datos de prueba generados correctamente. Recargue las páginas para ver cambios.');
    } catch (e) {
      console.error(e);
      alert('Error seeding data');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-[#f8f7f4]">
      <Sidebar user={currentUser} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <p className="text-stone-500 font-mono text-[10px] uppercase tracking-widest mb-1">Administración de Sistema</p>
          <h1 className="text-4xl font-serif italic text-stone-900 translate-x-[-2px]">Gestión de Personal</h1>
          <button 
            onClick={handleSeedData}
            className="mt-4 px-4 py-2 border border-amber-500 text-amber-600 text-[10px] uppercase font-bold tracking-widest hover:bg-amber-50 transition-all"
          >
            Generar Datos de Prueba (Demo)
          </button>
        </header>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <UserCog className="text-slate-600" size={20} />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Control de Accesos y Roles</h3>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100 bg-white">
                   <tr>
                      <th className="px-6 py-4">Usuario</th>
                      <th className="px-6 py-4">Correo Electrónico</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                   </tr>
                </thead>
                <tbody className="text-xs font-medium divide-y divide-slate-50">
                   {loading ? (
                      [1, 2, 3].map(i => (
                        <tr key={i} className="animate-pulse h-16">
                           <td colSpan={3} className="px-6"><div className="h-4 bg-slate-100 w-full rounded" /></td>
                        </tr>
                      ))
                   ) : (
                      users.map((staff) => (
                        <tr key={staff.uid} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white uppercase text-[10px]">
                                    {staff.name.charAt(0)}
                                 </div>
                                 <div>
                                   <p className="font-bold text-slate-800">{staff.name}</p>
                                   <div className={cn(
                                     "inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[8px] uppercase font-bold tracking-widest rounded",
                                     staff.role === 'admin' ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                                   )}>
                                     {staff.role}
                                   </div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-slate-500 font-medium">{staff.email}</td>
                           <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => handleRoleToggle(staff.uid, staff.role)}
                                className="text-[9px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-lg transition-colors border border-blue-100"
                              >
                                Cambiar a {staff.role === 'admin' ? 'Staff' : 'Admin'}
                              </button>
                           </td>
                        </tr>
                      ))
                   )}
                </tbody>
              </table>
           </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-8 bg-stone-100 border border-stone-200">
              <h4 className="text-stone-900 font-serif italic text-xl mb-2">Seguridad del Sistema</h4>
              <p className="text-stone-500 text-sm leading-relaxed mb-6">
                 Todos los cambios de rol quedan registrados en el log de auditoría. 
                 Los administradores tienen control total sobre el inventario y CRM.
              </p>
              <div className="flex items-center gap-4 text-stone-400 text-xs uppercase tracking-widest font-bold">
                 <ShieldCheck size={16} />
                 Protección de Datos Activa
              </div>
           </div>
           
           <div className="p-8 bg-stone-900 text-stone-100 border border-stone-800 flex flex-col justify-between">
              <div>
                 <h4 className="font-serif italic text-xl mb-2 text-amber-500">Invitación de Personal</h4>
                 <p className="text-stone-400 text-sm">
                    Para agregar nuevo personal, solicite que inicien sesión con su cuenta de Google institucional. 
                    Aparecerán automáticamente aquí para asignarles rol de acceso.
                 </p>
              </div>
              <button className="mt-6 w-fit px-6 py-3 border border-stone-700 text-[10px] uppercase font-bold tracking-widest hover:border-stone-100 transition-colors">
                 Enviar Instructivo
              </button>
           </div>
        </div>
      </main>
    </div>
  );
}
