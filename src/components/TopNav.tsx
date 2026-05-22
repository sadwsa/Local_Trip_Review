import { Link } from "react-router";
import { Menu, User, MapPin } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";

export function TopNav() {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center">
            <span className="font-bold text-xs tracking-tight">EXE</span>
          </div>
          <span className="font-serif italic font-bold text-xl text-primary-800 hidden sm:block">EXE101</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-8 font-medium text-sm text-slate-600">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <Link to="/search" className="hover:text-primary-600 transition-colors">Explore</Link>
          {user?.role === 'Admin' && (
            <Link to="/admin" className="hover:text-primary-600 transition-colors text-accent-700">Admin</Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link to="/profile" className="flex items-center gap-2">
              <img 
                src={user?.avatarUrl || "https://i.pravatar.cc/150"} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full border-2 border-primary-200 object-cover" 
              />
              <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-primary-700 hover:text-primary-800 hidden sm:block">Log in</Link>
              <Link to="/login" className="text-sm font-medium bg-primary-600 text-white px-4 py-2 rounded-full hover:bg-primary-700 transition-colors shadow-sm">
                Sign up
              </Link>
            </div>
          )}
          
          <button className="sm:hidden p-2 text-slate-600">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
