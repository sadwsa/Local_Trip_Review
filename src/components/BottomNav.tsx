import { Link, useLocation } from "react-router";
import { Home, Heart, MapPin, User } from "lucide-react";
import { cn } from "../lib/utils";

export function BottomNav() {
  const location = useLocation();

  const links = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/saved", icon: Heart, label: "Saved" },
    { to: "/check-in", icon: MapPin, label: "Check-in" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex justify-around items-center px-2 pb-2 z-50">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.to;

        return (
          <Link
            key={link.to}
            to={link.to}
            className={cn(
              "flex flex-col items-center gap-0.5 mt-2 transition-colors",
              isActive ? "text-primary-600" : "text-slate-400 hover:text-primary-400"
            )}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className={cn("text-[8px] font-bold uppercase tracking-tighter", isActive && "text-[9px]")}>
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
