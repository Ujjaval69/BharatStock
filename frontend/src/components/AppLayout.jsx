import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const { token, loading } = useAuth();

  if (loading) return <p style={{ padding: 40 }}>Loading…</p>;
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
