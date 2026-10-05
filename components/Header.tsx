
import React, { useState } from 'react';

const DEFAULT_NAV_ITEMS = [
  'About Us', 'UseCase', 'Gallery', 'Repos Pay'
];

interface HeaderProps {
  onSavingsClick?: () => void;
  onRoiClick?: () => void;
  onHomeClick?: () => void;
  navItems?: string[];
  rightNavItems?: string[];
  onNavItemClick?: (item: string) => void;
  showRoi?: boolean;
  activeCalculator?: 'savings' | 'roi' | null;
  onSecretClick?: () => void;
  onDownloadProposal?: () => void;
  onOpenLeadDetails?: () => void;
  activeRepresentative?: { name?: string; email?: string; role?: 'sales' | 'guest' } | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onSavingsClick,
  onRoiClick, 
  onHomeClick, 
  navItems = DEFAULT_NAV_ITEMS,
  rightNavItems = [],
  onNavItemClick,
  showRoi = true,
  activeCalculator = null,
  onSecretClick,
  onDownloadProposal,
  onOpenLeadDetails,
  activeRepresentative,
  onLoginClick,
  onLogoutClick
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (item: string) => {
    setIsMobileMenuOpen(false);
    if (onNavItemClick) {
      onNavItemClick(item);
    } else if (onHomeClick) {
      onHomeClick();
    }
  };

  const handleSavingsClick = () => {
    setIsMobileMenuOpen(false);
    if (onSavingsClick) {
      onSavingsClick();
    } else if (onRoiClick) {
      onRoiClick();
    }
  };

  const handleRoiClick = () => {
    setIsMobileMenuOpen(false);
    if (onRoiClick) onRoiClick();
  };

  return (
    <>
      <header className="bg-white fixed top-0 left-0 right-0 z-50 h-[72px] shadow-sm w-full">
        <div className="px-6 md:px-10 h-full">
          <div className="relative flex items-center justify-between h-full">
            
            {/* Left section: Main Desktop Navigation */}
            {/* Changed breakpoint to xl to prevent overlap on tablets/small laptops */}
            <div className="flex items-center">
              <nav className="hidden xl:flex items-center font-semibold text-gray-600 tracking-wider space-x-4 2xl:space-x-8 text-xs 2xl:text-sm">
                {navItems.map(item => (
                  <button 
                    key={item} 
                    onClick={() => handleNavClick(item)}
                    className="py-2 hover:text-black transition-colors uppercase bg-transparent border-none cursor-pointer whitespace-nowrap"
                  >
                    {item}
                  </button>
                ))}
                
                {/* Savings Calculator Button (Desktop) */}
                {showRoi && (onSavingsClick || onRoiClick) && (
                  <button 
                    onClick={handleSavingsClick}
                    className={`flex items-center space-x-2 font-semibold tracking-wider transition-colors bg-transparent border-none cursor-pointer uppercase whitespace-nowrap ${
                      activeCalculator === 'savings' ? 'text-blue-600' : 'text-gray-800 hover:text-black'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Savings Calculator</span>
                  </button>
                )}

                {/* ROI Calculator Button (Desktop) */}
                {showRoi && onRoiClick && (
                  <button 
                    onClick={handleRoiClick}
                    className={`flex items-center space-x-2 font-semibold tracking-wider transition-colors bg-transparent border-none cursor-pointer uppercase whitespace-nowrap ${
                      activeCalculator === 'roi' ? 'text-blue-600' : 'text-gray-800 hover:text-black'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>ROI Calculator</span>
                  </button>
                )}
              </nav>
            </div>
            
            {/* Center section: Logo */}
            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              onClick={onHomeClick}
            >
              <img
                src="https://i.postimg.cc/52fvQyLD/Repos-New-Logo-V1-1.png"
                alt="Repos logo"
                className="h-7 md:h-9 w-auto opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
            
            {/* Right section: Desktop Right Nav & Mobile Controls */}
            <div className="flex items-center justify-end gap-2 md:gap-3">
              {/* Lead Details & Analytics Button */}
              {onOpenLeadDetails && (
                <button
                  type="button"
                  onClick={onOpenLeadDetails}
                  className="flex items-center gap-1.5 px-3 py-1.5 md:px-3.5 md:py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs md:text-sm font-semibold tracking-wide transition-all shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap active:scale-95 border border-slate-700"
                  title="Access Lead Form Details & Quote Analytics in Bulk (Firebase Backend)"
                >
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Leads & Analytics</span>
                  <span className="sm:hidden">Data Hub</span>
                </button>
              )}

              {/* Download Proposal Button */}
              {onDownloadProposal && (
                <button
                  type="button"
                  onClick={onDownloadProposal}
                  className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-semibold tracking-wide transition-all shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap active:scale-95"
                  title="Download and view Commercial Proposal with Diesel Score"
                >
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">Download Proposal</span>
                  <span className="sm:hidden">Proposal</span>
                </button>
              )}

              {/* Representative Auth Pill */}
              {activeRepresentative?.name ? (
                <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-gray-200">
                  <div className="flex flex-col text-right">
                    <span className="text-[11px] font-bold text-gray-900 leading-tight truncate max-w-[130px]" title={activeRepresentative.name}>
                      {activeRepresentative.name}
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono truncate max-w-[130px]">
                      {activeRepresentative.email}
                    </span>
                  </div>
                  {onLogoutClick && (
                    <button
                      onClick={onLogoutClick}
                      className="text-[11px] text-gray-400 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      title="Sign Out"
                    >
                      Logout
                    </button>
                  )}
                </div>
              ) : (
                onLoginClick && (
                  <button
                    onClick={onLoginClick}
                    className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-300 hover:border-gray-500 text-xs font-semibold text-gray-700 hover:text-black transition-colors"
                  >
                    <span>Rep Login</span>
                  </button>
                )
              )}
              
              {/* Desktop Right Nav (e.g. FAQs) */}
              {/* Changed breakpoint to xl */}
              <div className="hidden xl:flex items-center space-x-6 2xl:space-x-8 font-semibold text-gray-600 tracking-wider text-xs 2xl:text-sm relative">
                  {onSecretClick && (
                    <button 
                      onClick={onSecretClick}
                      className="absolute -left-32 w-32 h-full bg-transparent border-none cursor-default z-50 focus:outline-none"
                      aria-label="Secret Action"
                    />
                  )}
                  {rightNavItems.map(item => (
                    <button 
                      key={item} 
                      onClick={() => handleNavClick(item)}
                      className="py-2 hover:text-black transition-colors uppercase bg-transparent border-none cursor-pointer whitespace-nowrap"
                    >
                      {item}
                    </button>
                  ))}
              </div>

              {/* Mobile Menu Button (Hamburger) - Visible below xl */}
              <div className="xl:hidden flex items-center">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 text-gray-600 hover:text-black focus:outline-none"
                  aria-label="Open Menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content overlap since header is fixed */}
      <div className="h-[72px]" />

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-white transition-transform duration-300 ease-in-out transform ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } xl:hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between px-6 h-[72px] border-b border-gray-100">
             <span className="text-lg font-bold text-gray-900 uppercase tracking-widest">Menu</span>
             <button 
               onClick={() => setIsMobileMenuOpen(false)}
               className="p-2 text-gray-600 hover:text-black"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
          </div>

          {/* Mobile Menu Items */}
          <div className="flex-1 overflow-y-auto py-8 px-6">
             <nav className="flex flex-col space-y-6">
                {navItems.map(item => (
                  <button 
                    key={item}
                    onClick={() => handleNavClick(item)}
                    className="text-left text-xl font-medium text-gray-800 hover:text-blue-600 transition-colors uppercase tracking-wide"
                  >
                    {item}
                  </button>
                ))}

                {/* Right Nav Items on Mobile */}
                {rightNavItems.map(item => (
                   <button 
                    key={item}
                    onClick={() => handleNavClick(item)}
                    className="text-left text-xl font-medium text-gray-800 hover:text-blue-600 transition-colors uppercase tracking-wide"
                  >
                    {item}
                  </button>
                ))}

                {onOpenLeadDetails && (
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenLeadDetails();
                    }}
                    className="flex items-center space-x-3 text-xl font-bold text-emerald-700 hover:text-emerald-900 transition-colors uppercase tracking-wide pt-4 border-t border-gray-100"
                  >
                    <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Leads & Analytics</span>
                  </button>
                )}

                {showRoi && (onSavingsClick || onRoiClick) && (
                  <button 
                    onClick={handleSavingsClick}
                    className={`flex items-center space-x-3 text-xl font-medium transition-colors uppercase tracking-wide pt-4 border-t border-gray-100 ${
                      activeCalculator === 'savings' ? 'text-blue-600 font-semibold' : 'text-gray-800 hover:text-blue-600'
                    }`}
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Savings Calculator</span>
                  </button>
                )}

                {showRoi && onRoiClick && (
                  <button 
                    onClick={handleRoiClick}
                    className={`flex items-center space-x-3 text-xl font-medium transition-colors uppercase tracking-wide ${
                      activeCalculator === 'roi' ? 'text-blue-600 font-semibold' : 'text-gray-800 hover:text-blue-600'
                    }`}
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                    <span>ROI Calculator</span>
                  </button>
                )}

                {onDownloadProposal && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onDownloadProposal();
                    }}
                    className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-md active:bg-blue-700 mt-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download Proposal</span>
                  </button>
                )}
             </nav>
          </div>
          
          <div className="p-6 bg-gray-50 border-t border-gray-100">
             <p className="text-xs text-gray-400 text-center">© 2024 Repos Energy India Pvt Ltd.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
