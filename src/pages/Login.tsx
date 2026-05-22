import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft } from "lucide-react";

export function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    
    try {
      await login();
      // Navigation is now handled by the useEffect above
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
        {/* Header */}
        <div className="px-5 pt-8 pb-4 flex items-center justify-between z-10 relative">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <ArrowLeft size={16} />
          </button>
        </div>

        {/* Background Image Header */}
        <div className="absolute top-0 left-0 right-0 h-1/2 min-h-[300px]">
          <div className="absolute inset-0 bg-primary-950/80 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=2000" 
            alt="Travel explore" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 mt-10">
            <h1 className="font-serif italic text-4xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-primary-100/90 text-sm max-w-xs leading-relaxed">Log in to track your adventures and discover new places.</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex-1 overflow-y-auto px-6 pt-10 pb-24 sm:pb-8 bg-white relative z-30 mt-32 rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-100 text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full mt-6 bg-primary-700 hover:bg-primary-800 text-white font-bold py-4 rounded-full transition-all text-sm uppercase tracking-wider shadow-lg shadow-primary-700/30 disabled:opacity-70 disabled:shadow-none flex items-center justify-center gap-3"
            >
              {isLoading ? "Connecting..." : (
                <>
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
            
            <p className="text-center mt-6 text-[11px] font-medium text-slate-500">
              By continuing, you agree to our <a href="#" className="text-primary-700 font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-primary-700 font-bold hover:underline">Privacy Policy</a>.
            </p>
            
            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
              <p>Authentication powered by Firebase</p>
            </div>
          </div>
        </div>
    </div>
  );
}
