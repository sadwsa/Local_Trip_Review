import { useState } from "react";
import { Search as SearchIcon, SlidersHorizontal, ArrowLeft } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { DestinationCard } from "../components/DestinationCard";
import { useNavigate, useSearchParams } from "react-router";
import { cn } from "../lib/utils";
import { removeVietnameseTones } from "../utils/stringUtils";

export function Search() {
  const navigate = useNavigate();
  const { destinations, categories } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  
  const activeCategory = searchParams.get("cat");
  const setActiveCategory = (id: string | null) => {
    if (id) {
      setSearchParams({ cat: id });
    } else {
      setSearchParams({});
    }
  };

  const filtered = destinations.filter(d => {
    const q = removeVietnameseTones(query.toLowerCase());
    const nameNorm = removeVietnameseTones(d.name.toLowerCase());
    const descNorm = removeVietnameseTones(d.description.toLowerCase());
    
    const matchesQuery = nameNorm.includes(q) || descNorm.includes(q);
    const matchesCat = activeCategory ? d.categoryId === activeCategory : true;
    return matchesQuery && matchesCat;
  });

  return (
    <div className="flex-1 flex flex-col h-full">
        
        {/* Header */}
        <div className="px-5 pt-8 pb-4 flex items-center justify-between border-b border-slate-100">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100">
            <ArrowLeft size={16} />
          </button>
          <h1 className="font-serif italic font-bold text-lg text-primary-800">Search</h1>
          <div className="w-8"></div>
        </div>

        {/* Scrollable Mobile Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 pb-24">
          
          {/* Search Bar */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search destinations..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 pl-10 text-xs focus:ring-2 focus:ring-primary-500 transition-all outline-none text-slate-800"
              autoFocus
            />
            <SearchIcon className="w-4 h-4 absolute left-4 top-3 text-slate-400" />
            <button className="absolute right-4 top-3 text-slate-400 hover:text-primary-600">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            <button 
              onClick={() => setActiveCategory(null)}
              className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors", 
                !activeCategory ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600"
              )}
            >
              All
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors", 
                  activeCategory === cat.id ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Results Grid */}
          <div>
            <h2 className="font-bold text-sm text-slate-900 mb-3">
              {query ? `Results for "${query}"` : "Explore All"} 
              <span className="text-slate-500 font-normal ml-1">({filtered.length})</span>
            </h2>
            
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {filtered.map(dest => (
                  <DestinationCard key={dest.id} destination={dest} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-slate-500 text-sm">No destinations found.</p>
                <button 
                  onClick={() => {setQuery(""); setActiveCategory(null);}}
                  className="mt-4 text-[10px] font-bold text-primary-600 uppercase tracking-widest hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
