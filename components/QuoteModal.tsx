import React, { useState } from 'react';
import { QuoteData } from '../types';
import { 
  generateQuotePDF, 
  extractSelectedOptions 
} from '../utils/pdfGenerator';
import { 
  TERMS_AND_CONDITIONS, 
  BANK_ACCOUNT_DETAILS, 
  REPOS_COMPANY_FOOTER 
} from '../constants';

interface QuoteModalProps {
  data?: QuoteData;
  quoteData?: QuoteData;
  isOpen?: boolean;
  onClose: () => void;
  onEditDetails?: () => void;
}

const QuoteModal: React.FC<QuoteModalProps> = ({ data, quoteData, onClose, onEditDetails }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const activeData = quoteData || data;

  const customerName = activeData?.customerDetails?.name?.trim() ? activeData.customerDetails.name : '{Name}';
  const location = activeData?.customerDetails?.state?.trim() ? activeData.customerDetails.state : '{State}';
  const application = activeData?.customerDetails?.industry?.trim() ? activeData.customerDetails.industry : '{Industry}';
  const fleetSize = activeData?.customerDetails?.fleetSize?.toString().trim() ? activeData.customerDetails.fleetSize.toString() : '{Fleet Size}';
  const monthlyConsumption = activeData?.customerDetails?.consumption?.trim() ? activeData.customerDetails.consumption : '{Monthly Consumption}';
  const numberOfSite = (activeData?.customerDetails?.numberOfSites || activeData?.customerDetails?.numberOfSite)?.toString().trim() 
    ? (activeData.customerDetails.numberOfSites || activeData.customerDetails.numberOfSite)!.toString() 
    : '{Number of sites}';

  const { 
    isRfdZ,
    baseName,
    baseFeatureText,
    formattedBasePrice,
    capacityText,
    modifications,
    addons,
    formattedSubtotal,
    operationsRowCount,
  } = extractSelectedOptions(activeData || ({} as QuoteData));

  const handleDownload = async () => {
    if (!activeData) return;
    setIsDownloading(true);
    try {
      await generateQuotePDF(activeData);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[130] p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-auto overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Quotation Preview</span>
          </div>
          <div className="flex items-center space-x-3">
            {onEditDetails && (
              <button
                type="button"
                onClick={onEditDetails}
                className="px-3.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                Edit Lead Details
              </button>
            )}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-4 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-black transition flex items-center space-x-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{isDownloading ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
            <button 
              type="button"
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Document Body (Matches New Quotation Format Exactly) */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-white font-sans text-gray-900 leading-normal">
          {/* Centered Repos Logo */}
          <div className="flex justify-center pb-6">
            <img 
              src="https://i.postimg.cc/52fvQyLD/Repos-New-Logo-V1-1.png" 
              alt="Repos" 
              className="h-10 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Proposal Heading */}
          <div className="mb-3">
            <h2 className="text-sm md:text-base font-bold text-gray-950 tracking-tight">
              Commercial Proposal for Total Fuel Management (TFM):
            </h2>
          </div>

          {/* Table 1: Particulars & Details */}
          <div className="border border-gray-300 rounded-sm overflow-hidden mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-200 border-b border-gray-300 text-gray-900 font-bold">
                  <th className="py-2 px-4 w-2/5 border-r border-gray-300">Particulars</th>
                  <th className="py-2 px-4 w-3/5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                <tr>
                  <td className="py-2 px-4 font-bold text-gray-900 bg-gray-50/40 border-r border-gray-300">Customer Name</td>
                  <td className="py-2 px-4 text-gray-900">{customerName}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-bold text-gray-900 bg-gray-50/40 border-r border-gray-300">Location</td>
                  <td className="py-2 px-4 text-gray-900">{location}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-bold text-gray-900 bg-gray-50/40 border-r border-gray-300">Application</td>
                  <td className="py-2 px-4 text-gray-900">{application}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-bold text-gray-900 bg-gray-50/40 border-r border-gray-300">Fleet Size</td>
                  <td className="py-2 px-4 text-gray-900">{fleetSize}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-bold text-gray-900 bg-gray-50/40 border-r border-gray-300">Monthly Consumption</td>
                  <td className="py-2 px-4 text-gray-900">{monthlyConsumption}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-bold text-gray-900 bg-gray-50/40 border-r border-gray-300">Number of Site</td>
                  <td className="py-2 px-4 text-gray-900">{numberOfSite}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Table 2: Stage | Feature | Pricing (New Quotation Grid) */}
          <div className="border border-gray-300 rounded-sm overflow-hidden mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-200 border-b border-gray-300 text-gray-900 font-bold text-center">
                  <th className="py-2 px-3 w-[15%] border-r border-gray-300">Stage</th>
                  <th className="py-2 px-3 w-[60%] border-r border-gray-300">Feature</th>
                  <th className="py-2 px-3 w-[25%]">Pricing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {/* Row 1: Procurement (part 1) */}
                <tr>
                  <td rowSpan={2} className="py-3 px-3 border-r border-gray-300 font-bold text-gray-900 text-center align-middle bg-white">
                    Procurement
                  </td>
                  <td rowSpan={2} className="py-3 px-4 border-r border-gray-300 align-middle">
                    <p className="font-medium text-gray-900 mb-2">Doorstep Diesel Delivery with assured:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-800">
                      <li>Fuel quality</li>
                      <li>Fuel quantity</li>
                      <li>Fuel delivery</li>
                    </ul>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-gray-900 text-right align-middle border-b border-gray-300">
                    No extra fuel delivery charges
                  </td>
                </tr>
                {/* Row 2: Procurement (part 2) */}
                <tr>
                  <td className="py-2.5 px-4 font-bold text-gray-900 text-right align-middle">
                    Diesel at retail price
                  </td>
                </tr>

                {/* Operations Base Model */}
                <tr>
                  <td rowSpan={operationsRowCount} className="py-3 px-3 border-r border-gray-300 font-bold text-gray-900 text-center align-middle bg-white">
                    Operations
                  </td>
                  <td className="py-2.5 px-4 border-r border-gray-300">
                    <p className="font-bold text-gray-950">Base Model:</p>
                    <p className="text-gray-800 whitespace-pre-line">
                      {isRfdZ
                        ? '3-in-1 DATUM Technology for organized fuel storage, dispensing and authorization with:'
                        : baseFeatureText}
                    </p>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-gray-900 text-right align-middle">
                    ₹{formattedBasePrice}
                  </td>
                </tr>

                {/* Selected Modifications */}
                {modifications.map(mod => (
                  <tr key={mod.id}>
                    <td className="py-2 px-4 border-r border-gray-300 text-gray-800 whitespace-pre-line">
                      {mod.featureText}
                    </td>
                    <td className="py-2 px-4 text-gray-900 text-right align-middle font-medium">
                      ₹{mod.formattedPrice}
                    </td>
                  </tr>
                ))}

                {/* Add-ons Header (rendered if any add-on selected) */}
                {addons.length > 0 && (
                  <tr className="bg-gray-50/50">
                    <td className="py-1.5 px-4 border-r border-gray-300 font-bold text-gray-900">
                      Add-ons:
                    </td>
                    <td className="py-1.5 px-4 font-bold text-gray-900 text-right">
                      Add-ons:
                    </td>
                  </tr>
                )}

                {/* Selected Add-ons */}
                {addons.map(addon => (
                  <tr key={addon.id}>
                    <td className="py-2 px-4 border-r border-gray-300 text-gray-800 whitespace-pre-line">
                      {addon.featureText}
                    </td>
                    <td className="py-2 px-4 text-gray-900 text-right align-middle font-medium">
                      ₹{addon.formattedPrice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Model Selected & Options Details */}
          <div className="mb-6 space-y-3">
            <div>
              <p className="text-base font-bold text-gray-950">
                Pricing Model Selected: ₹{formattedSubtotal} + Taxes
              </p>
              <p className="text-sm font-bold text-gray-950">
                {capacityText}
              </p>
            </div>

            <div className="pt-2 text-xs text-gray-900 space-y-1">
              <p className="font-bold text-gray-950">Options to avail DATUM:</p>
              <p className="text-gray-800">1. Outright Purchase - starting at ₹3,49,999*</p>
              <p className="text-gray-800">2. Monthly Lease - starting at ₹14,999*</p>
            </div>

            <p className="text-xs text-gray-700 pt-1">
              We duly acknowledge the above-mentioned model selection, and commit to provide the terms as agreed.
            </p>

            <div className="text-xs text-gray-900 pt-1">
              <p>Regards,</p>
              <p className="font-bold text-gray-950 mt-0.5">Team Repos</p>
            </div>
          </div>

          {/* Terms and Conditions Section */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200">
            <h3 className="text-sm font-bold text-gray-950 mb-3">
              Terms and Conditions : Please read
            </h3>
            <div className="space-y-3.5 text-xs text-gray-700 leading-relaxed bg-gray-50/60 p-4 rounded-lg border border-gray-200">
              {TERMS_AND_CONDITIONS.map((term) => (
                <p key={term.prefix}>
                  <strong className="text-gray-950">{term.prefix} {term.title}</strong>{' '}
                  <span className="whitespace-pre-line">{term.content}</span>
                </p>
              ))}
            </div>
          </div>

          {/* Bank Account Details Section (Added After Terms and Conditions) */}
          <div className="mt-6 p-5 bg-slate-50 border border-slate-300 rounded-lg shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Account Details:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs">
              <div>
                <span className="font-semibold text-slate-600 block">Account Number:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{BANK_ACCOUNT_DETAILS.accountNumber}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-600 block">Name of the Beneficiary:</span>
                <span className="font-medium text-slate-900">{BANK_ACCOUNT_DETAILS.beneficiaryName}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-600 block">Bank Name:</span>
                <span className="font-medium text-slate-900">{BANK_ACCOUNT_DETAILS.bankName}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-600 block">Branch:</span>
                <span className="font-medium text-slate-900">{BANK_ACCOUNT_DETAILS.branch}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-600 block">IFSC Code:</span>
                <span className="font-mono font-bold text-slate-900">{BANK_ACCOUNT_DETAILS.ifscCode}</span>
              </div>
            </div>
          </div>

          {/* Official Company Footer with divider (Matches Screenshot Footer) */}
          <div className="mt-8 pt-4 border-t border-gray-300 text-center space-y-1">
            <p className="text-xs font-bold text-gray-900 tracking-wider">
              {REPOS_COMPANY_FOOTER.name}
            </p>
            <p className="text-[11px] text-gray-600">
              {REPOS_COMPANY_FOOTER.address}
            </p>
            <p className="text-[11px] text-gray-600">
              {REPOS_COMPANY_FOOTER.cinGst}
            </p>
            <p className="text-[11px] text-blue-600 font-medium">
              <a href={`https://${REPOS_COMPANY_FOOTER.website}`} target="_blank" rel="noreferrer" className="hover:underline">{REPOS_COMPANY_FOOTER.website}</a>
              {' | '}
              <a href={`mailto:${REPOS_COMPANY_FOOTER.email}`} className="hover:underline">{REPOS_COMPANY_FOOTER.email}</a>
              {' | '}
              <span>{REPOS_COMPANY_FOOTER.phone}</span>
            </p>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Verified official quotation format
          </span>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-5 py-2 text-xs font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition flex items-center space-x-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{isDownloading ? 'Generating PDF...' : 'Download Quotation PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteModal;
