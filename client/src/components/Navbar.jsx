import React from 'react';

export const Navbar = ({ activeTab, setActiveTab, onOpenLeadForm, businessProfile }) => {
  const name = businessProfile?.name || 'ABC Academy';
  const phone = businessProfile?.phone || '+91 98765 43210';
  const tagline = businessProfile?.tagline || 'Premier Coaching for NEET & JEE (Main + Advanced)';

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-gray-200/80">
      {/* Top Demo Mode Alert Ribbon */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white text-[11px] font-semibold py-1 px-4 text-center tracking-wide flex items-center justify-center gap-2 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
        <span>DEMO MODE ACTIVE: Realistic sample coaching institute data. Unverified fees and schedules are illustrative demonstration models.</span>
      </div>

      <div className="h-16 max-w-[1360px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none shrink-0"
          onClick={() => setActiveTab('chat')}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-[22px]">school</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-gray-900 tracking-tight text-base leading-none">{name}</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px] tracking-wide uppercase">
                NEET • JEE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] tracking-wide uppercase border border-amber-300">
                DEMO
              </span>
            </div>
            <span className="text-[11px] text-gray-500 font-normal truncate max-w-[280px] sm:max-w-none">{tagline}</span>
          </div>
        </div>

        {/* Center Nav Pills */}
        <nav className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200/80 shrink-0">
          <button
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-white text-blue-700 shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
            onClick={() => setActiveTab('chat')}
          >
            AI Counselor
          </button>

          <button
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'courses'
                ? 'bg-white text-blue-700 shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
            onClick={() => setActiveTab('courses')}
          >
            Batches & Fees
          </button>

          <button
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'admin'
                ? 'bg-white text-blue-700 shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
            onClick={() => setActiveTab('admin')}
          >
            Admin Dashboard
          </button>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-gray-600">
            <span className="material-symbols-outlined text-[16px] text-blue-700">call</span>
            <span className="font-semibold text-gray-900">{phone}</span>
          </div>
          <button
            className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5"
            onClick={onOpenLeadForm}
          >
            <span className="material-symbols-outlined text-[16px]">support_agent</span>
            <span>Book Free Demo Class</span>
          </button>
        </div>

      </div>
    </header>
  );
};
