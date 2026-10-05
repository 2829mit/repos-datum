import React, { useState, useEffect } from 'react';

interface SlideModalProps {
  isOpen: boolean;
  onNext: () => void;
  onClose?: () => void;
}

const SLIDES = [
  {
    id: 1,
    title: 'Datum Overview',
    url: 'https://i.postimg.cc/QxhYNPPR/Whats-App-Image-2026-09-22-at-11-01-33-PM.jpg',
    alt: 'Datum Overview Poster',
  },
  {
    id: 2,
    title: 'Datum Solution Overview',
    url: 'https://i.postimg.cc/dQWQ75gg/Whats-App-Image-2026-09-23-at-2-17-10-PM.jpg',
    alt: 'Datum Solution Overview',
  },
];

const SlideModal: React.FC<SlideModalProps> = ({ isOpen, onNext, onClose }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Reset to first slide whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSlideIndex(0);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      // Preload second image
      const preloadImg = new Image();
      preloadImg.src = SLIDES[1].url;

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNextClick();
      } else if (e.key === 'ArrowLeft' && currentSlideIndex > 0) {
        setCurrentSlideIndex((prev) => prev - 1);
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentSlideIndex]);

  if (!isOpen) return null;

  const currentSlide = SLIDES[currentSlideIndex];
  const isLastSlide = currentSlideIndex === SLIDES.length - 1;

  const handleNextClick = () => {
    if (!isLastSlide) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      onNext();
    }
  };

  const handlePrevClick = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black flex items-center justify-center animate-fade-in w-screen h-screen overflow-hidden select-none">
      {/* Top Header Bar with Indicators and optional Exit */}
      <div className="absolute top-4 left-4 right-4 md:top-6 md:left-8 md:right-8 z-30 flex items-center justify-between pointer-events-none">
        {/* Slide Indicator Badge */}
        <div className="pointer-events-auto flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-lg">
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlideIndex
                    ? 'w-6 bg-blue-500 shadow-sm shadow-blue-500/50'
                    : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold tracking-wider uppercase text-gray-300">
            {currentSlideIndex + 1} of {SLIDES.length}
          </span>
        </div>

        {/* Close/Skip button if onClose provided */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="pointer-events-auto w-10 h-10 rounded-full bg-black/60 hover:bg-white/15 text-gray-300 hover:text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/10 cursor-pointer shadow-lg"
            aria-label="Skip slides"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Fullscreen Image Container */}
      <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4 md:p-6 pb-20 md:pb-24">
        <img
          key={currentSlide.id}
          src={currentSlide.url}
          alt={currentSlide.alt}
          className="w-full h-full object-contain max-w-full max-h-full shadow-2xl transition-opacity duration-300 animate-fade-in"
        />
      </div>

      {/* Floating Bottom Navigation Controls */}
      <div className="absolute bottom-5 right-5 md:bottom-8 md:right-8 z-30 flex items-center gap-3">
        {/* Previous Button - shown on 2nd slide */}
        {currentSlideIndex > 0 && (
          <button
            type="button"
            onClick={handlePrevClick}
            className="inline-flex items-center gap-2 px-5 py-3 md:px-6 md:py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium text-sm md:text-base rounded-xl transition-all backdrop-blur-md border border-white/15 cursor-pointer shadow-xl active:scale-95"
          >
            <svg
              className="w-4 h-4 md:w-5 md:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back</span>
          </button>
        )}

        {/* Next / Proceed Button */}
        <button
          type="button"
          onClick={handleNextClick}
          className="inline-flex items-center gap-2.5 px-7 py-3 md:px-8 md:py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm md:text-base rounded-xl transition-all shadow-2xl hover:shadow-blue-500/40 transform active:scale-95 cursor-pointer"
        >
          <span>{isLastSlide ? 'Continue' : 'Next'}</span>
          <svg
            className="w-4 h-4 md:w-5 md:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SlideModal;
