import { Navigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 h-[100dvh] w-full">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}
