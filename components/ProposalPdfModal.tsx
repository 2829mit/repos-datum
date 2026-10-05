import React, { useEffect } from 'react';

interface ProposalPdfModalProps {
  isOpen: boolean;
  pdfBlobUrl: string | null;
  fileName: string;
  onDownload: () => void;
  onClose: () => void;
}

export const ProposalPdfModal: React.FC<ProposalPdfModalProps> = ({
  isOpen,
  pdfBlobUrl,
  fileName,
  onDownload,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[140] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0f1115] text-white w-full max-w-5xl rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[94vh] max-h-[920px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex-shrink-0 bg-[#0f1115] border-b border-white/10 px-4 py-3.5 md:px-6 md:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-base shadow-inner">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Document Preview
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.2 rounded-full font-mono">
                  Diesel Score Included
                </span>
              </div>
              <h2 className="text-sm md:text-base font-bold tracking-tight text-white truncate max-w-[280px] sm:max-w-md">
                Commercial Proposal & Fuel Audit
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs md:text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              title="Download PDF"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span className="hidden sm:inline">Save PDF</span>
              <span className="sm:hidden">Save</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close Preview"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body: Embedded PDF or Fallback */}
        <div className="flex-1 w-full h-full bg-[#1a1c22] relative flex flex-col">
          {pdfBlobUrl ? (
            <iframe
              src={pdfBlobUrl}
              className="w-full h-full border-0 bg-white"
              title="Proposal Document"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <svg className="w-12 h-12 text-gray-500 animate-spin mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-sm">Preparing high-resolution Proposal PDF...</p>
            </div>
          )}

          {/* Fallback Banner for browsers that restrict iframe PDF previews */}
          <div className="flex-shrink-0 bg-[#0f1115] border-t border-white/5 px-4 py-2 flex items-center justify-between text-[11px] text-gray-400">
            <span>
              File: <span className="font-mono text-gray-300">{fileName}</span>
            </span>
            <button
              type="button"
              onClick={onDownload}
              className="text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
            >
              Can't view PDF? Download directly
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalPdfModal;
