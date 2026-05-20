import { useState } from "react";
import { DestinationCard } from "../components/DestinationCard";
import { useData } from "../contexts/DataContext";
import { Search as SearchIcon, Star } from "lucide-react";
import { Link } from "react-router";
import { cn } from "../lib/utils";
import { removeVietnameseTones } from "../utils/stringUtils";

export function Home() {
  const { destinations, categories, isLoading } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const featured = destinations.length > 0 ? destinations[0] : null;

  const filteredDestinations = destinations.filter(d => {
    const q = removeVietnameseTones(searchQuery.toLowerCase());
    const nameNorm = removeVietnameseTones(d.name.toLowerCase());
    const descNorm = removeVietnameseTones(d.description.toLowerCase());
    
    const matchesQuery = nameNorm.includes(q) || descNorm.includes(q);
    const matchesCat = activeCategory ? d.categoryId === activeCategory : true;
    return matchesQuery && matchesCat;
  });

  return (
    <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 pb-24">
      {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Discover</h1>
            <p className="text-slate-500 text-sm">Find your next perfect destination</p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search destinations..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 pl-10 text-xs focus:ring-2 focus:ring-primary-500 transition-all outline-none text-slate-800"
            />
            <SearchIcon className="w-4 h-4 absolute left-4 top-3 text-slate-400" />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            <button 
              onClick={() => setActiveCategory(null)}
              className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors", 
                !activeCategory ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors", 
                  activeCategory === cat.id ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-primary-50 hover:text-primary-700"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {(!searchQuery && !activeCategory) ? (
            <>
              {/* Hero Destination */}
              {featured ? (
            <Link to={`/destination/${featured.id}`} className="relative block h-48 w-full rounded-2xl overflow-hidden shadow-lg group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity group-hover:opacity-90"></div>
              {featured.imageUrl ? (
                <img src={featured.imageUrl} alt={featured.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : <div className="absolute inset-0 w-full h-full bg-slate-400" />}
              <div className="absolute bottom-4 left-4 z-20 text-white">
                <p className="text-[10px] font-bold text-accent-300 uppercase tracking-wider mb-1">Featured</p>
                <h3 className="text-xl font-serif font-bold text-white mb-0.5">{featured.name}</h3>
              </div>
              <div className="absolute top-3 right-3 z-20 bg-white/20 backdrop-blur-md rounded-full px-2 py-1 text-[10px] text-white flex items-center gap-1 font-bold">
                <Star className="w-3 h-3 fill-accent-400 text-accent-400" />
                {featured.averageRating.toFixed(1)}
              </div>
            </Link>
          ) : (
             <div className="relative block h-48 w-full rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-sm font-medium">
               No destinations found.
             </div>
          )}

          {/* Popular Grid */}
          <div>
            <div className="flex justify-between items-end mb-3">
              <h3 className="font-bold text-sm text-slate-900">Popular Destinations</h3>
              <Link to="/search" className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">See all</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[...destinations]
                .sort((a, b) => (b.checkInCount || 0) - (a.checkInCount || 0))
                .slice(0, 4)
                .map((dest) => (
                <DestinationCard key={dest.id} destination={dest} />
              ))}
            </div>
          </div>

          {/* Most Loved */}
          <div>
            <div className="flex justify-between items-end mb-3">
              <h3 className="font-bold text-sm text-slate-900">Most Loved ❤️</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
               {[...destinations]
                 .sort((a, b) => {
                   if (b.averageRating !== a.averageRating) {
                     return b.averageRating - a.averageRating;
                   }
                   return (b.reviewCount || 0) - (a.reviewCount || 0);
                 })
                 .slice(0, 3)
                 .map(dest => (
                 <div key={dest.id} className="min-w-[140px] max-w-[140px]">
                   <DestinationCard destination={dest} />
                 </div>
               ))}
            </div>
          </div>
          </>
          ) : (
            <div>
              <h2 className="font-bold text-sm text-slate-900 mb-3">
                {searchQuery ? `Results for "${searchQuery}"` : "Filtered Results"} 
                <span className="text-slate-500 font-normal ml-1">({filteredDestinations.length})</span>
              </h2>
              
              {filteredDestinations.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {filteredDestinations.map(dest => (
                    <DestinationCard key={dest.id} destination={dest} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-slate-500 text-sm">No destinations found.</p>
                  <button 
                    onClick={() => {setSearchQuery(""); setActiveCategory(null);}}
                    className="mt-4 text-[10px] font-bold text-primary-600 uppercase tracking-widest hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
  );
}
