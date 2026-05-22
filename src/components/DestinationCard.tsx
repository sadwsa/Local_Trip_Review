import React from "react";
import { Link, useNavigate } from "react-router";
import { Heart, MapPin, Star } from "lucide-react";
import { Destination } from "../types";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  key?: React.Key;
  destination: Destination;
  className?: string;
  linkState?: any;
}

export function DestinationCard({ destination, className, linkState }: Props) {
  const { user, toggleSaveDestination } = useAuth();
  const navigate = useNavigate();
  
  const isSaved = user?.savedDestinations?.includes(destination.id) || false;

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    await toggleSaveDestination(destination.id);
  };

  return (
    <Link 
      to={`/destination/${destination.id}`}
      state={linkState}
      className={cn("group flex flex-col space-y-2", className)}
    >
      <div className="relative h-28 sm:h-48 overflow-hidden bg-slate-200 rounded-xl">
        {destination.imageUrl ? (
          <img 
            src={destination.imageUrl} 
            alt={destination.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : <div className="w-full h-full bg-slate-200" />}
        <button 
          onClick={handleToggleLike}
          className="absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md bg-white/20 hover:bg-white/40 transition-colors z-10"
        >
          <Heart 
            size={16} 
            className={cn("transition-colors", isSaved ? "fill-accent-500 text-accent-500" : "text-white")} 
          />
        </button>
        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full backdrop-blur-md bg-black/40 text-white text-[10px] font-bold">
          <Star size={10} className="fill-accent-300 text-accent-300" />
          <span>{destination.averageRating.toFixed(1)}</span>
        </div>
      </div>
      
      <div className="px-1 flex flex-col">
        <h3 className="font-bold text-[11px] sm:text-sm text-slate-900 leading-tight line-clamp-1 group-hover:text-primary-700 transition-colors">
          {destination.name}
        </h3>
        
        <div className="flex items-center gap-1 text-slate-500 text-[9px] sm:text-xs mt-1">
          <MapPin size={10} className="text-primary-500 sm:w-3 sm:h-3" />
          <span className="truncate">{destination.checkInCount} {destination.checkInCount === 1 ? 'Check-in' : 'Check-ins'}</span>
        </div>
      </div>
    </Link>
  );
}
