import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

import type { Role } from './api';
import { useAuth } from './authContext';

function FullScreenLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center" role="status" aria-label="Carregando">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <FullScreenLoader />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <FullScreenLoader />;
  }

  return status === 'authenticated' ? <Navigate to="/" replace /> : <Outlet />;
}

export function RoleGate({ role, children, fallback = null }: { role: Role; children: ReactNode; fallback?: ReactNode }) {
  const { session } = useAuth();

  return session?.account.role === role ? children : fallback;
}
