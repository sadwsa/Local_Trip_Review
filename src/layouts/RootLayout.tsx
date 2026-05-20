import { Outlet, useLocation } from "react-router";
import { BottomNav } from "../components/BottomNav";

export function RootLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';

  return (
    <div className="flex-1 w-full bg-slate-50 sm:bg-slate-100 flex justify-center min-h-screen">
      <div className="w-full max-w-lg bg-white sm:my-8 sm:rounded-[40px] sm:shadow-2xl sm:border-[8px] sm:border-slate-900 overflow-hidden flex flex-col relative h-[100dvh] sm:h-[800px]">
        <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50">
          <Outlet />
        </main>
        {!isAuthPage && <BottomNav />}
      </div>
    </div>
  );
}
