
import React from 'react';
import Header from './Header';

interface LandingPageProps {
  onEnterApp: () => void;
  onExploreClick: () => void;
  onSavingsClick?: () => void;
  onRoiClick?: () => void;
  onFaqClick: () => void;
  onReposPayClick: () => void;
  onAboutClick: () => void;
  onDownloadProposal?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onEnterApp, 
  onExploreClick, 
  onSavingsClick,
  onRoiClick, 
  onFaqClick, 
  onReposPayClick, 
  onAboutClick,
  onDownloadProposal
}) => {
  const handleNavClick = (item: string) => {
    if (item === 'Build Your Own Datum' || item === 'Get Started') {
      onEnterApp();
    } else if (item === 'Explore') {
      onExploreClick();
    } else if (item === 'Savings Calculator' && (onSavingsClick || onRoiClick)) {
      if (onSavingsClick) onSavingsClick();
      else if (onRoiClick) onRoiClick();
    } else if (item === 'ROI Calculator' && onRoiClick) {
      onRoiClick();
    } else if (item === 'FAQs') {
      onFaqClick();
    } else if (item === 'Repos Pay') {
      onReposPayClick();
    } else if (item === 'About Us') {
      onAboutClick();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header 
        navItems={['About Us', 'Explore', 'Repos Pay', 'Savings Calculator', 'ROI Calculator']}
        rightNavItems={['FAQs']}
        onNavItemClick={handleNavClick}
        onHomeClick={() => {}}
        showRoi={false}
        onDownloadProposal={onDownloadProposal}
      />
      
      {/* Section 1: Hero Cover */}
      <div className="relative h-[calc(100vh-72px)] overflow-hidden bg-black group shrink-0 flex flex-col items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4 md:p-6 pb-20 sm:pb-22 md:pb-24">
          <img 
            src="https://i.postimg.cc/QxhYNPPR/Whats-App-Image-2026-09-22-at-11-01-33-PM.jpg"
            alt="Datum"
            className="max-h-full max-w-full w-auto h-auto object-contain shadow-2xl scale-[1.05] md:scale-[1.08] transition-transform duration-300"
          />
        </div>

        {/* CTA and Explore indicator pinned at bottom to avoid covering image text */}
        <div className="absolute bottom-3 md:bottom-5 z-10 flex flex-col items-center gap-1.5 md:gap-2">
          <button 
            onClick={onEnterApp}
            className="group relative px-8 py-2.5 md:px-10 md:py-3 border-2 border-white bg-black/60 hover:bg-white text-white hover:text-black uppercase tracking-widest text-xs md:text-sm font-bold transition-all duration-300 backdrop-blur-md shadow-lg"
          >
            Get Started
          </button>
          
          <div className="animate-bounce cursor-pointer flex flex-col items-center opacity-80 hover:opacity-100 transition-opacity" onClick={onExploreClick}>
            <span className="text-[10px] tracking-widest uppercase text-white">Explore</span>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </div>
        </div>
      </div>

      {/* Section 2: Transforming Energy Distribution (New Video Section) */}
      <div className="relative h-screen overflow-hidden bg-black shrink-0">
         <video 
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
            autoPlay 
            muted 
            loop 
            playsInline
         >
            <source src="https://res.cloudinary.com/dt8jmqu8d/video/upload/v1764178964/Transforming_Energy_Distribution_through_Repos_Ecosystem_ayqp2x.mp4" type="video/mp4" />
            Your browser does not support the video tag.
         </video>
         
         <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Section 3: Trusted Brands */}
      <div className="bg-white py-24 px-6 flex flex-col items-center text-center">
        <p className="text-xs md:text-sm font-bold tracking-[0.2em] text-gray-500 uppercase mb-8">Trusted Partners</p>
        <h2 className="text-3xl md:text-5xl font-bold text-black mb-16 tracking-tight">Powering Industry Leaders</h2>
        <div className="max-w-7xl mx-auto w-full flex justify-center">
          <img 
            src="https://res.cloudinary.com/dt8jmqu8d/image/upload/v1764218439/Screenshot_2025-11-27_100713_olo5at.png" 
            alt="Trusted Brands" 
            className="w-full h-auto max-w-5xl object-contain mix-blend-multiply opacity-90 hover:opacity-100 transition-opacity duration-500"
          />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
