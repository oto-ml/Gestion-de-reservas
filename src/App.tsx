import { ReactNode, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getDocFromServer } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { UserProfile } from './types';

// Pages
import Dashboard from './pages/Staff/Dashboard';
import CRM from './pages/Staff/CRM';
import Admin from './pages/Staff/Admin';
import StaffLogin from './pages/Staff/Login';
import PublicBooking from './pages/Public/Booking';
import PublicHome from './pages/Public/Home';
import Payment from './pages/Public/Payment';
import Confirmation from './pages/Public/Confirmation';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Connection test as per critical constraint
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'system', 'health'));
      } catch (error: any) {
        if (error.message?.includes('offline')) {
          console.error("Firebase connection is offline. Check configuration.");
        }
      }
    }
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        } else {
          // If user exists in Auth but not in Firestore yet (first time login with admin email maybe)
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-stone-300 border-t-stone-800 rounded-full animate-spin"></div>
          <p className="mt-4 font-serif italic text-stone-600">Grand Reserve AI...</p>
        </div>
      </div>
    );
  }

  const ProtectedRoute = ({ children, role }: { children: ReactNode, role?: 'admin' | 'staff' }) => {
    if (!user) return <Navigate to="/staff/login" />;
    if (role === 'admin' && user.role !== 'admin') return <Navigate to="/staff/dashboard" />;
    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicHome />} />
        <Route path="/book" element={<PublicBooking />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/confirmation/:id" element={<Confirmation />} />

        {/* Staff Routes */}
        <Route path="/staff/login" element={user ? <Navigate to="/staff/dashboard" /> : <StaffLogin />} />
        <Route path="/staff/dashboard" element={<ProtectedRoute><Dashboard user={user!} /></ProtectedRoute>} />
        <Route path="/staff/crm" element={<ProtectedRoute><CRM /></ProtectedRoute>} />
        <Route path="/staff/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
