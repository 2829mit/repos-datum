
import React, { useState, useRef, useEffect } from 'react';
import type { AccessoryOption, IotOption, TankOption, DispensingUnitOption, SafetyUpgradeOption, CustomerDetails, LicenseOption } from '../types';
import { 
  CONSUMPTION_OPTIONS, 
  TANK_OPTIONS, 
  REPOS_OS_OPTIONS, 
  DISPENSING_UNIT_OPTIONS, 
  MECHANICAL_INCLUSION_OPTIONS, 
  SAFETY_UPGRADE_OPTIONS, 
  LICENSE_OPTIONS, 
  SAFETY_UNIT_OPTIONS,
  RFD_Z_BASE_OPTIONS, RFD_Z_DISPENSING_UNITS, RFD_Z_UPGRADE_OPTIONS,
  RFD_SENSORS_AND_CONTROLLER_OPTIONS,
  RFD_REPOS_OS_OPTIONS
} from '../constants';
import { getSafetyImage } from '../utils/vehicleHelpers';
import { DieselScoreResult, formatScore, getScoreLevelLabel, SCORE_COLOR_CONFIG } from '../utils/dieselScore';

interface ConfiguratorProps {
  customerDetails: CustomerDetails | null;
  paymentMode: 'outright' | 'installments' | 'lease' | 'emi';
  setPaymentMode: (mode: 'outright' | 'installments' | 'lease' | 'emi') => void;
  selectedTank: TankOption['id'];
  setSelectedTank: (tankId: TankOption['id']) => void;
  selectedReposOsOptions: AccessoryOption[];
  onReposOsToggle: (option: AccessoryOption) => void;
  selectedMechanicalInclusionOptions: AccessoryOption[];
  onMechanicalInclusionToggle: (option: AccessoryOption) => void;
  
  // Updated to Array for Multi-Select
  selectedDecantation: IotOption[];
  onDecantationToggle: (option: IotOption) => void;
  
  // Updated to Array for Multi-Select
  selectedDispensingUnits: DispensingUnitOption[];
  onDispensingUnitToggle: (option: DispensingUnitOption) => void;
  
  selectedSafetyUnits: AccessoryOption[];
  onSafetyUnitToggle: (option: AccessoryOption) => void;
  selectedSafetyUpgrades: SafetyUpgradeOption[];
  onSafetyUpgradeToggle: (option: SafetyUpgradeOption) => void;

  rfidTagsQuantity: number;
  setRfidTagsQuantity: (qty: number) => void;

  selectedLicenseOptions: LicenseOption[];
  selectedConsumption: string | null;
  onConsumptionSelect: (consumption: string) => void;
  
  totalContractValue: number; 
  gstAmount: number;
  totalInclTax?: number;
  finalPrice: number; 
  
  recommendedTankId: TankOption['id'] | null;
  showPrices: boolean;
  onResetConfiguration?: () => void;
  
  // Handlers for opening modals
  onOpenComparison: () => void;
  onOpenQuote: () => void;
  onCalculateRoi: () => void;

  // Custom Product Props
  selectedProduct: 'rfd-portable' | 'rfd-z';
  setSelectedProduct: (prod: 'rfd-portable' | 'rfd-z') => void;

  // RFD Z state
  rfdZBase: string;
  setRfdZBase: (val: string) => void;
  rfdZDispensingUnit: string;
  setRfdZDispensingUnit: (val: string) => void;
  rfdZUpgrades: string[];
  onRfdZUpgradeToggle: (val: string) => void;

  dieselScoreResult?: DieselScoreResult | null;
  onOpenDieselScore?: () => void;
  onOpenDieselQuestionnaire?: () => void;
}

const ChevronUp: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const ChevronDown: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const InfoIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Configurator: React.FC<ConfiguratorProps> = ({
  customerDetails,
  paymentMode,
  setPaymentMode,
  selectedTank,
  setSelectedTank,
  selectedReposOsOptions,
  onReposOsToggle,
  selectedMechanicalInclusionOptions,
  onMechanicalInclusionToggle,
  selectedDecantation,
  onDecantationToggle,
  selectedDispensingUnits,
  onDispensingUnitToggle,
  selectedSafetyUnits,
  onSafetyUnitToggle,
  selectedSafetyUpgrades,
  onSafetyUpgradeToggle,
  rfidTagsQuantity,
  setRfidTagsQuantity,
  selectedConsumption,
  onConsumptionSelect,
  
  totalContractValue,
  gstAmount,
  totalInclTax,
  finalPrice,
  
  recommendedTankId,
  showPrices,
  onResetConfiguration,
  
  onOpenComparison,
  onOpenQuote,
  onCalculateRoi,

  // Custom Product Props
  selectedProduct,
  setSelectedProduct,

  // RFD Z state
  rfdZBase,
  setRfdZBase,
  rfdZDispensingUnit,
  setRfdZDispensingUnit,
  rfdZUpgrades,
  onRfdZUpgradeToggle,

  dieselScoreResult,
  onOpenDieselScore,
  onOpenDieselQuestionnaire,
}) => {
  const [learnMoreOption, setLearnMoreOption] = useState<SafetyUpgradeOption | IotOption | AccessoryOption | null>(null);

  const [isStickyFooterVisible, setIsStickyFooterVisible] = useState(true);
  const [isPricingDetailsOpen, setIsPricingDetailsOpen] = useState(true);
  const [showIncludedOptions, setShowIncludedOptions] = useState(false);
  
  const pricingSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPrices) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStickyFooterVisible(!entry.isIntersecting);
      },
      { root: null, threshold: 0.1, rootMargin: "0px" }
    );

    const currentRef = pricingSectionRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.disconnect();
    };
  }, [showPrices]);

  const formatCurrency = (amount: number) => {
    if (!showPrices) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPrice = (monthlyPrice: number) => {
    if (!showPrices) return '';
    if (paymentMode === 'outright') {
        const fullPrice = monthlyPrice * 36;
        return fullPrice === 0 ? formatCurrency(0) : `+${formatCurrency(fullPrice)}`;
    }
    return monthlyPrice === 0 ? formatCurrency(0) : `+${formatCurrency(monthlyPrice)}`;
  };
  
  // Check if all RFD Z add-on options are selected
  const allOptionsSelected = selectedProduct === 'rfd-z' 
    ? RFD_Z_UPGRADE_OPTIONS.every(opt => rfdZUpgrades.includes(opt.id))
    : true;

  // Enforce default outright payment mode when not all options are selected
  useEffect(() => {
    if (selectedProduct === 'rfd-z' && !allOptionsSelected && paymentMode !== 'outright') {
      setPaymentMode('outright');
    }
  }, [selectedProduct, allOptionsSelected, paymentMode, setPaymentMode]);

  const currentTank = TANK_OPTIONS.find(t => t.id === selectedTank);

  const tankBasePrice = currentTank ? currentTank.price : 0;

  // DETERMINE MULTIPLIER BASED ON PAYMENT MODE
  const multiplier = paymentMode === 'outright' ? 36 : 1;

  let pricingItems: { name: string; price: number }[] = [];

  if (selectedProduct === 'rfd-z') {
    const baseOpt = RFD_Z_BASE_OPTIONS.find(c => c.id === rfdZBase);
    const basePrice = (baseOpt ? (paymentMode === 'outright' && baseOpt.totalAmount !== undefined ? baseOpt.totalAmount : baseOpt.price * multiplier) : 0);
    const baseName = baseOpt ? baseOpt.name : 'Datum Z 2KL';
    const duOpt = RFD_Z_DISPENSING_UNITS.find(d => d.id === rfdZDispensingUnit);
    const duName = duOpt ? `Dispensing Unit: ${duOpt.name}` : 'Dispensing Unit';

    pricingItems = [
      { name: baseName, price: basePrice },
      { name: duName, price: 0 },
      ...rfdZUpgrades.map(id => {
        const opt = RFD_Z_UPGRADE_OPTIONS.find(o => o.id === id);
        return { name: opt ? opt.name : id, price: (opt ? (paymentMode === 'outright' && opt.totalAmount !== undefined ? opt.totalAmount : opt.price * multiplier) : 0) };
      })
    ];
  } else {
    pricingItems = [
      { name: `RPS Base Price (${currentTank?.name || ''} Tank)`, price: tankBasePrice * multiplier },
      ...selectedDispensingUnits.map(du => ({ name: du.name, price: du.price * multiplier })),
      ...selectedReposOsOptions.map(opt => ({ name: opt.name, price: opt.price * multiplier })),
      ...selectedDecantation.map(opt => ({ name: opt.name, price: opt.price * multiplier })),
      ...selectedMechanicalInclusionOptions.map(opt => ({ name: opt.name, price: opt.price * multiplier })),
      ...selectedSafetyUnits.map(opt => ({ name: opt.name, price: opt.price * multiplier })),
      ...selectedSafetyUpgrades
        .filter(opt => !(selectedTank === '30kl' && opt.id === 'advanced-skid'))
        .map(opt => ({ name: opt.name, price: opt.price * multiplier })),
    ];

    if (rfidTagsQuantity > 0) {
      pricingItems.push({
        name: `RFID Tags (${rfidTagsQuantity} nos)`,
        price: (rfidTagsQuantity * 49) * multiplier
      });
    }

    pricingItems = pricingItems.filter(item => !item.name.includes('RPS Base Price'));
  }

  const paidItems = pricingItems.filter(item => item.price > 0);
  const includedItems = pricingItems.filter(item => item.price === 0);

  const safeTotalInclTax = totalInclTax ?? (totalContractValue + gstAmount);

  let displayedPriceLabel = 'Monthly Payment';
  let breakdownPrice = finalPrice;

  if (paymentMode === 'outright') {
    displayedPriceLabel = 'Total Price (Inc. 18% GST)';
    breakdownPrice = safeTotalInclTax;
  } else if (paymentMode === 'lease') {
    displayedPriceLabel = 'Monthly Lease Rental';
    breakdownPrice = 19999;
  } else if (paymentMode === 'emi') {
    displayedPriceLabel = 'Monthly EMI Payment';
    breakdownPrice = 49999;
  }

  const footerPrice = paymentMode === 'outright' ? totalContractValue : finalPrice;
  
  let subtotalDisplay = finalPrice;
  let subtotalLabel = 'Total Monthly Amount';

  if (paymentMode === 'outright') {
    subtotalDisplay = totalContractValue;
    subtotalLabel = 'Subtotal (Excl. GST)';
  } else if (paymentMode === 'lease') {
    subtotalDisplay = 19999;
    subtotalLabel = 'Lease Rental / Month';
  } else if (paymentMode === 'emi') {
    subtotalDisplay = 49999;
    subtotalLabel = 'EMI / Month';
  }

  return (
    <div className="bg-white text-gray-800 lg:h-full h-auto flex flex-col relative lg:overflow-hidden">
      <div className="flex-grow lg:overflow-y-auto overflow-visible scroll-smooth pb-24">
        <div className="pb-6 md:pb-10">
          
          {/* Sticky Header Section with Clear Button */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 md:px-10 mb-6 flex justify-between items-center shadow-sm">
             <h1 className="text-xl md:text-2xl font-medium text-[#171A20]">Repos Datum Z</h1>
             {onResetConfiguration && (
               <button 
                 onClick={onResetConfiguration}
                 className="flex-shrink-0 text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full transition-colors uppercase tracking-wide shadow-sm"
               >
                 Clear All
               </button>
             )}
          </div>

          <div className="px-6 md:px-10">
            {/* Diesel Score Assessment Banner if score exists or available */}
            {dieselScoreResult && onOpenDieselScore && (
              <div 
                onClick={onOpenDieselScore}
                className="my-4 p-3.5 rounded-2xl bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-white/10 hover:border-white/20 transition-all cursor-pointer shadow-lg flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-inner border"
                    style={{
                      backgroundColor: SCORE_COLOR_CONFIG[dieselScoreResult.finalLevel].badgeBg,
                      color: SCORE_COLOR_CONFIG[dieselScoreResult.finalLevel].accentHex,
                      borderColor: `${SCORE_COLOR_CONFIG[dieselScoreResult.finalLevel].accentHex}40`,
                    }}
                  >
                    {formatScore(dieselScoreResult.finalScore)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">
                        Diesel Score
                      </span>
                      <span 
                        className="text-[10px] font-bold px-2 py-0.2 rounded-full border uppercase"
                        style={{
                          backgroundColor: SCORE_COLOR_CONFIG[dieselScoreResult.finalLevel].badgeBg,
                          color: SCORE_COLOR_CONFIG[dieselScoreResult.finalLevel].accentHex,
                          borderColor: `${SCORE_COLOR_CONFIG[dieselScoreResult.finalLevel].accentHex}40`,
                        }}
                      >
                        {getScoreLevelLabel(dieselScoreResult.finalLevel)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 font-medium">
                      Score: {formatScore(dieselScoreResult.finalScore)}/10 • Click to view breakdown
                    </p>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            )}

            <div className="flex justify-around my-8 text-center">
              {[
                { label: 'Speed', value: '50L/m' },
                { label: 'Tracking', value: '100%' },
                { label: 'Monitoring', value: '24/7' },
              ].map(spec => (
                <div key={spec.label}>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900">{spec.value}</p>
                  <p className="text-xs sm:text-[14px] leading-[20px] text-[#393C41] mt-1">{spec.label}</p>
                </div>
              ))}
            </div>

            {/* RFD Z Configuration Panel */}
            <div className="animate-fade-in space-y-8">
              {/* Base Options */}
              <div className="mb-[45px]">
                <h2 className="font-medium text-[20px] leading-[28px] text-[#171A20] mb-3 text-center">Select Base Option</h2>
                <div className="space-y-4">
                  {RFD_Z_BASE_OPTIONS.map(option => (
                    <button 
                      key={option.id}
                      onClick={() => setRfdZBase(option.id)}
                      className={`group relative w-full p-4 border rounded-lg text-left transition-all duration-300 ${
                        rfdZBase === option.id 
                          ? 'border-gray-400 ring-1 ring-gray-400 bg-gray-50' 
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-[14px] leading-[20px] text-[#171A20]">{option.name}</p>
                        <span className="font-medium text-[14px] text-gray-500">
                          {showPrices ? (paymentMode === 'outright' ? formatCurrency(option.totalAmount || Math.round(option.price * 36)) : formatPrice(option.price)) : ''}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dispensing Unit */}
              <div className="mb-[45px]">
                <h2 className="font-medium text-[20px] leading-[28px] text-[#171A20] mb-3 text-center">Dispensing Unit</h2>
                <div className="grid grid-cols-2 gap-3">
                  {RFD_Z_DISPENSING_UNITS.map(unit => {
                    const isSelected = rfdZDispensingUnit === unit.id;
                    return (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() => setRfdZDispensingUnit(unit.id)}
                        className={`group relative p-4 border rounded-lg text-left transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? 'border-gray-400 ring-1 ring-gray-400 bg-gray-50 shadow-sm'
                            : 'border-gray-300 hover:border-gray-500 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-[14px] leading-[20px] text-[#171A20]">{unit.name}</p>
                          <div className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? 'border-gray-800' : 'border-gray-300 group-hover:border-gray-400'
                          }`}>
                            {isSelected && (
                              <div className="h-2 w-2 rounded-full bg-gray-800" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upgrades */}
              <div className="mb-[45px]">
                <h2 className="font-medium text-[20px] leading-[28px] text-[#171A20] mb-3 text-center">Add-Ons</h2>
                <div className="space-y-2">
                  {RFD_Z_UPGRADE_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      onClick={() => onRfdZUpgradeToggle(option.id)}
                      className={`group w-full flex items-center p-4 border rounded-lg text-left cursor-pointer transition-all duration-300 ${
                        rfdZUpgrades.includes(option.id) ? 'border-gray-400 ring-1 ring-gray-400 bg-gray-50' : 'border-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className={`h-5 w-5 border rounded flex-shrink-0 flex items-center justify-center transition-colors mr-3 ${
                        rfdZUpgrades.includes(option.id) ? 'bg-gray-600 border-gray-600' : 'bg-white border-gray-300'
                      }`}>
                        {rfdZUpgrades.includes(option.id) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-grow flex justify-between items-center relative">
                        <p className="font-medium text-[14px] leading-[20px] text-[#171A20]">{option.name}</p>
                        <span className="font-medium text-[14px] leading-[20px] text-[#171A20] pr-8">
                          {showPrices ? (option.displayPrice ? option.displayPrice : formatPrice(option.price)) : ''}
                        </span>
                        {option.description && (
                          <div role="button" onClick={(e) => { e.stopPropagation(); setLearnMoreOption(option as any); }} className="absolute right-0 top-1/2 -translate-y-1/2 opacity-70 group-hover:opacity-100 transition-all duration-200 text-black hover:bg-black/10 rounded-full p-1" title="View Details">
                            <InfoIcon />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">* 18% GST will be added to the amount after selection</p>
              </div>
            </div>

            {/* Pricing Breakdown */}
            {showPrices ? (
              <div ref={pricingSectionRef} className="pt-8 border-t border-gray-200">
                <h2 className="text-xl font-medium text-gray-900 mb-4 text-center">Pricing & Payment Options</h2>

                {/* Payment Mode Options - Only shown for RFD Z when ALL options are selected */}
                {selectedProduct === 'rfd-z' ? (
                  allOptionsSelected ? (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                          Select Payment Mode
                        </label>
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                          ✓ All options selected
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-100 rounded-xl">
                        {[
                          { id: 'lease', label: '1 - Lease', price: '₹19,999/mo' },
                          { id: 'emi', label: '2 - EMI', price: '₹49,999/mo' },
                          { id: 'outright', label: '3 - Outright', price: formatCurrency(totalContractValue) },
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            onClick={() => setPaymentMode(mode.id as any)}
                            className={`py-3 px-2 rounded-lg text-xs font-bold transition-all duration-200 text-center flex flex-col items-center justify-center relative ${
                              paymentMode === mode.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                          >
                            <span className="uppercase tracking-wider font-bold">{mode.label}</span>
                            <span className={`text-[11px] font-medium mt-1 ${paymentMode === mode.id ? 'text-blue-100' : 'text-blue-600'}`}>{mode.price}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null
                ) : (
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-medium text-gray-700">Payment Mode</span>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`${paymentMode === 'installments' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>Monthly</span>
                      <button onClick={() => setPaymentMode(paymentMode === 'installments' ? 'outright' : 'installments')} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${paymentMode === 'outright' ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${paymentMode === 'outright' ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                      <span className={`${paymentMode === 'outright' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>Full Price</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mb-6 cursor-pointer group select-none" onClick={() => setIsPricingDetailsOpen(!isPricingDetailsOpen)}>
                  <h3 className="text-lg font-medium text-gray-900">Pricing Breakdown</h3>
                  <div className="p-1 rounded-full group-hover:bg-gray-100 transition-colors">{isPricingDetailsOpen ? <ChevronUp /> : <ChevronDown />}</div>
                </div>

                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isPricingDetailsOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="space-y-3 text-sm text-gray-600 mb-8">
                      {paidItems.map((item, idx) => (
                        <div key={`paid-${idx}`} className="flex justify-between">
                          <span>{item.name}</span>
                          <span>{formatCurrency(item.price)}</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 my-3 pt-3">
                          <div className="flex justify-between font-semibold text-gray-800">
                              <span>{subtotalLabel}</span>
                              <span>{formatCurrency(subtotalDisplay)}</span>
                          </div>
                          {paymentMode === 'outright' && (
                            <div className="flex justify-between text-gray-600 mt-1">
                                <span>GST (18%)</span>
                                <span>{formatCurrency(gstAmount)}</span>
                            </div>
                          )}
                          {paymentMode === 'emi' && (
                             <div className="mt-2 text-xs text-gray-500 italic text-right">36 Months EMI</div>
                          )}
                      </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 mb-8">
                     <span className="text-lg font-semibold text-gray-900">{displayedPriceLabel}</span>
                     <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(breakdownPrice)}</span>
                        {paymentMode === 'outright' && <p className="text-xs text-gray-500 font-normal">Inclusive of GST</p>}
                        {paymentMode !== 'outright' && <p className="text-xs text-gray-500 font-normal">Per Month</p>}
                     </div>
                </div>

                <div className="flex gap-4">
                     <button 
                       onClick={onOpenQuote} 
                       className="w-full py-3.5 px-4 rounded-lg text-sm font-semibold transition-all shadow-sm bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                     >
                       View Quote
                     </button>
                </div>
              </div>
            ) : (
              <div className="pt-8 border-t border-gray-200 mb-8">
                  <button 
                    className="w-full py-3.5 px-4 rounded-lg text-sm font-semibold transition-all shadow-sm bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                    onClick={onOpenQuote}
                  >
                    View Quote
                  </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showPrices && (
        <div className={`fixed bottom-0 left-0 right-0 lg:absolute lg:bottom-0 lg:left-0 lg:right-0 p-4 z-20 w-full pointer-events-none transition-transform duration-300 ease-in-out ${isStickyFooterVisible ? 'translate-y-0' : 'translate-y-[120%]'}`}>
          <div className="bg-white border border-gray-200 shadow-lg rounded-xl p-4 pointer-events-auto">
             <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    {formatCurrency(footerPrice)}
                  </p>
                  {(paymentMode === 'lease' || paymentMode === 'emi' || paymentMode === 'installments') && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Per Month</p>}
                  {paymentMode === 'outright' && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Excl. GST</p>}
                </div>
                <button 
                  onClick={onOpenQuote}
                  className="bg-blue-600 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-md text-sm sm:text-base font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                >
                  View Quote
                </button>
             </div>
          </div>
        </div>
      )}
      {learnMoreOption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setLearnMoreOption(null)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative p-6" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLearnMoreOption(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 text-center">{learnMoreOption.name}</h3>
            {((learnMoreOption as any).infoImageUrl || (learnMoreOption as any).imageUrl || ((learnMoreOption as any).id?.includes('fire')) || ((learnMoreOption as any).id?.includes('crash'))) ? (
               <div className="flex justify-center mb-6"><img src={(learnMoreOption as any).infoImageUrl || ((learnMoreOption as SafetyUpgradeOption).id.includes('fire') || (learnMoreOption as SafetyUpgradeOption).id.includes('crash') ? getSafetyImage(selectedTank, (learnMoreOption as SafetyUpgradeOption).id) : (learnMoreOption as any).imageUrl)} alt={learnMoreOption.name} className="max-h-64 object-contain" /></div>
            ) : null}
            <p className="text-gray-600 text-center leading-relaxed">{(learnMoreOption as any).description || 'No description available.'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configurator;
