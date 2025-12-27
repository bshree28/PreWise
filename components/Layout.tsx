
import React from 'react';
import { ChefHat, Settings, Info } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative bg-[#0f172a]">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-purple-600 blur-[100px]" />
      </div>

      <header className="sticky top-0 z-50 px-6 py-4 glass-morphism border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <ChefHat className="text-blue-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-outfit tracking-tight">LUMINA <span className="text-blue-400">AR</span></h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Smart Kitchen Interface</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <Info className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 relative z-10">
        {children}
      </main>

      <footer className="p-4 text-center text-slate-500 text-xs border-t border-white/5 mt-auto">
        &copy; 2024 Lumina Kitchen Systems • Property Lifestyle Demo
      </footer>
    </div>
  );
};
