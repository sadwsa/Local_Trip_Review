import { MapPin, ArrowLeft, Loader2 } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { dbService } from "../models/Database";
import { where } from "firebase/firestore";
import { Destination } from "../types";

export function CheckIn() {
  const navigate = useNavigate();
  const { destinations } = useData();
  const { user } = useAuth();
  
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set());
  const [isLoadingCheckIns, setIsLoadingCheckIns] = useState(true);

  useEffect(() => {
    if (user) {
      dbService.checkIns.getAll([where('userId', '==', user.id)])
        .then(checkIns => {
          const ids = new Set(checkIns.map(c => c.destinationId));
          setCheckedInIds(ids);
        })
        .finally(() => setIsLoadingCheckIns(false));
    } else {
      setIsLoadingCheckIns(false);
    }
  }, [user]);

  const checkedInDestinations = destinations.filter(d => checkedInIds.has(d.id));

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
        {/* Header */}
        <div className="px-5 pt-8 pb-4 flex items-center justify-between border-b border-slate-100">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100">
             <ArrowLeft size={16} />
          </button>
          <h1 className="font-serif italic font-bold text-lg text-primary-800">Check-In</h1>
          <div className="w-8"></div>
        </div>

        {/* Scrollable Mobile Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6 pb-24 bg-slate-50">
          <h2 className="font-bold text-sm text-slate-900 mb-4 px-1">Your Check-ins</h2>
          {isLoadingCheckIns ? (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin text-primary-500" size={24} />
            </div>
          ) : checkedInDestinations.length === 0 ? (
            <div className="text-center p-4 text-slate-500 text-sm bg-white rounded-xl shadow-sm border border-slate-100">
              You haven't checked into any destinations yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {checkedInDestinations.map(dest => (
                <div 
                  key={dest.id} 
                  onClick={() => navigate(`/destination/${dest.id}`, { state: { fromCheckIn: true } })}
                  className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex gap-4 items-center cursor-pointer hover:border-primary-200 transition-colors"
                >
                  {dest.imageUrl ? (
                    <img 
                      src={dest.imageUrl} 
                      alt={dest.name} 
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  ) : <div className="w-16 h-16 rounded-xl bg-slate-200 border border-slate-200" />}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 leading-tight truncate">{dest.name}</h3>
                    <div className="flex items-center gap-1 text-green-600 text-xs mt-1 font-medium">
                      <span>✓ Checked in</span>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-200 shrink-0">
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
