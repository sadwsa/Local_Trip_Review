import { useAuth } from "../contexts/AuthContext";
import { Navigate, useNavigate } from "react-router";
import { ArrowLeft, Heart } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { DestinationCard } from "../components/DestinationCard";

export function Saved() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { destinations } = useData();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const savedDestinations = destinations.filter(dest => user.savedDestinations?.includes(dest.id));

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
        <div className="px-5 pt-8 pb-4 flex items-center justify-between border-b border-slate-100 bg-white">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100">
             <ArrowLeft size={16} />
          </button>
          <h1 className="font-serif italic font-bold text-lg text-primary-800">Saved</h1>
          <div className="w-8"></div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 pb-24 text-center">
          {savedDestinations.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-left">
              {savedDestinations.map(dest => (
                 <DestinationCard key={dest.id} destination={dest} />
              ))}
            </div>
          ) : (
            <div className="py-20">
              <Heart size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium text-sm">No saved destinations.</p>
              <p className="text-slate-400 text-xs mt-1">Tap the heart icon on a destination to save it.</p>
            </div>
          )}
        </div>
    </div>
  );
}
