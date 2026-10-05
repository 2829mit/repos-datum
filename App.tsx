
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import CarVisualizer from './components/CarVisualizer';
import Configurator from './components/Configurator';
import LeadFormModal from './components/LeadFormModal';
import LoginModal from './components/LoginModal';
import LandingPage from './components/LandingPage';
import ExplorePage from './components/ExplorePage';
import FaqPage from './components/FaqPage';
import ReposPayPage from './components/ReposPayPage';
import AboutUsPage from './components/AboutUsPage';
import ComparisonModal from './components/ComparisonModal';
import QuoteModal from './components/QuoteModal';
import SlideModal from './components/SlideModal';
import DieselScoreQuestionnaireModal from './components/DieselScoreQuestionnaireModal';
import DieselScoreResultModal from './components/DieselScoreResultModal';
import { LeadDetailsModal } from './components/LeadDetailsModal';
import { onReposAuthStateChange, logoutRepos } from './services/firebase';
import { generateQuotePDF, getFinalPartcode } from './utils/pdfGenerator';
import { logQuoteGeneration } from './services/api';
import type { AccessoryOption, IotOption, TankOption, DispensingUnitOption, SafetyUpgradeOption, CustomerDetails, LicenseOption, QuoteData } from './types';
import type { DieselScoreResult } from './utils/dieselScore';
import { 
  TANK_OPTIONS,
  RFD_Z_BASE_OPTIONS, RFD_Z_DISPENSING_UNITS, RFD_Z_UPGRADE_OPTIONS,
  
  
  
  
  
  RFD_SENSORS_AND_CONTROLLER_OPTIONS,
  RFD_REPOS_OS_OPTIONS
} from './constants';
import { getRecommendedTankId } from './utils/vehicleHelpers';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'app' | 'explore' | 'faq' | 'reposPay' | 'about'>('landing');

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true);
  const [userRole, setUserRole] = useState<'sales' | 'guest' | null>(null);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const [activeRepresentative, setActiveRepresentative] = useState<{
    name?: string;
    email?: string;
    role?: 'sales' | 'guest';
  } | null>(null);
  const [isLeadDetailsModalOpen, setIsLeadDetailsModalOpen] = useState(false);

  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [isDieselQuestionnaireOpen, setIsDieselQuestionnaireOpen] = useState(false);
  const [isDieselResultOpen, setIsDieselResultOpen] = useState(false);
  const [dieselScoreResult, setDieselScoreResult] = useState<DieselScoreResult | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [activeCalculator, setActiveCalculator] = useState<'savings' | 'roi' | null>(null);
  
  // Modal States
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [currentQuoteData, setCurrentQuoteData] = useState<QuoteData | null>(null);
  
  // Track if we are waiting for lead form submission to generate a quote
  const [pendingQuoteGeneration, setPendingQuoteGeneration] = useState(false);

  // Discount Feature State
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [paymentMode, setPaymentMode] = useState<'outright' | 'installments' | 'lease' | 'emi'>('lease');
  
  // Selected Tank - Base product remains selected
  const [selectedTank, setSelectedTank] = useState<TankOption['id']>(() => 
    TANK_OPTIONS[0]?.id || '22kl'
  );
  
  // Selection States
  const [selectedReposOsOptions, setSelectedReposOsOptions] = useState<AccessoryOption[]>([]);
  const [selectedMechanicalInclusionOptions, setSelectedMechanicalInclusionOptions] = useState<AccessoryOption[]>([]);
  const [selectedDecantation, setSelectedDecantation] = useState<IotOption[]>([]);
  const [selectedDispensingUnits, setSelectedDispensingUnits] = useState<DispensingUnitOption[]>([]);
  const [selectedSafetyUnits, setSelectedSafetyUnits] = useState<AccessoryOption[]>([]);
  const [selectedSafetyUpgrades, setSelectedSafetyUpgrades] = useState<SafetyUpgradeOption[]>([]);
  const [selectedLicenseOptions, setSelectedLicenseOptions] = useState<LicenseOption[]>([]);
  const [rfidTagsQuantity, setRfidTagsQuantity] = useState<number>(0);

  const [selectedConsumption, setSelectedConsumption] = useState<string | null>(null);
  const [recommendedTankId, setRecommendedTankId] = useState<TankOption['id'] | null>(null);

  // Product Variant state
  const [selectedProduct, setSelectedProduct] = useState<'rfd-portable' | 'rfd-z'>('rfd-z');

  // RFD Z state
  const [rfdZBase, setRfdZBase] = useState<string>('datum-2kl');
  const [rfdZDispensingUnit, setRfdZDispensingUnit] = useState<string>('gvr');
  const [rfdZUpgrades, setRfdZUpgrades] = useState<string[]>([]);

  const [latestAddedOption, setLatestAddedOption] = useState<{name: string, description?: string} | null>(null);

  const handleRfdZUpgradeToggle = (val: string) => {
    setRfdZUpgrades(prev => {
      if (prev.includes(val)) {
        return prev.filter(x => x !== val);
      }
      return [...prev, val];
    });
    if (!rfdZUpgrades.includes(val)) {
      const opt = RFD_Z_UPGRADE_OPTIONS.find(x => x.id === val);
      if (opt) setLatestAddedOption({ name: opt.name, description: opt.description });
    }
  };

  useEffect(() => {
    if (selectedProduct === 'rfd-z') {
      setPaymentMode('lease');
    }
  }, [selectedProduct]);

  // Compute if we should show the capacity platform preview
  const showCapacityPreview = useMemo(() => {
    const addOnCount = 
      selectedReposOsOptions.length + 
      selectedMechanicalInclusionOptions.length + 
      selectedDecantation.length + 
      selectedDispensingUnits.length + 
      selectedSafetyUnits.length + 
      selectedSafetyUpgrades.length +
      (rfidTagsQuantity > 0 ? 1 : 0);
    
    return addOnCount === 0;
  }, [
    selectedReposOsOptions, 
    selectedMechanicalInclusionOptions, 
    selectedDecantation, 
    selectedDispensingUnits, 
    selectedSafetyUnits, 
    selectedSafetyUpgrades,
    rfidTagsQuantity
  ]);

  useEffect(() => {
    const s3BaseUrl = 'https://drf-media-data.s3.ap-south-1.amazonaws.com/compressor_aws/ShortPixelOptimized/';
    const imageCount = 31;
    const imageUrls = Array.from({ length: imageCount }, (_, i) => `${s3BaseUrl}${i + 1}.png`);
    
    imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onReposAuthStateChange((user, rep) => {
      if (user && rep) {
        setActiveRepresentative({ name: rep.name, email: rep.email, role: 'sales' });
        setUserRole('sales');
        setLoggedInUserId(rep.name);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = (role: 'sales' | 'guest', repName?: string, repEmail?: string) => {
    setUserRole(role);
    if (repName || repEmail) {
      setActiveRepresentative({ name: repName, email: repEmail, role });
      setLoggedInUserId(repName || repEmail || '');
    }
    setIsLoginModalOpen(false);
    setIsLeadFormOpen(true);
  };

  const handleLogout = async () => {
    await logoutRepos();
    setActiveRepresentative(null);
    setUserRole('guest');
    setLoggedInUserId(null);
  };

  const handleConsumptionSelect = (consumption: string) => {
    setSelectedConsumption(consumption);
    const recId = getRecommendedTankId(consumption);
    setRecommendedTankId(recId);
  };
  
  const handleTankChange = (tankId: TankOption['id']) => {
    setSelectedTank(tankId);
    if (tankId === '30kl') {
      setSelectedSafetyUpgrades(prev => prev.filter(opt => opt.id !== 'advanced-skid'));
    }
  };

  const handleReposOsToggle = (option: AccessoryOption) => {
    setSelectedReposOsOptions(prev => {
      const exists = prev.find(o => o.id === option.id);
      if (exists) return prev.filter(o => o.id !== option.id);
      setLatestAddedOption({ name: option.name, description: option.description || option.name });
      return [...prev, option];
    });
  };

  const handleMechanicalInclusionToggle = (option: AccessoryOption) => {
    setSelectedMechanicalInclusionOptions(prev => {
      const exists = prev.find(o => o.id === option.id);
      if (exists) return prev.filter(o => o.id !== option.id);
      setLatestAddedOption({ name: option.name, description: option.description || option.name });
      return [...prev, option];
    });
  };

  const handleDecantationToggle = (option: IotOption) => {
    setSelectedDecantation(prev => {
      const exists = prev.find(o => o.id === option.id);
      if (exists) return prev.filter(o => o.id !== option.id);
      setLatestAddedOption({ name: option.name, description: option.description || option.subtext });
      return [...prev, option];
    });
  };

  const handleSafetyUnitToggle = (option: AccessoryOption) => {
    setSelectedSafetyUnits(prev => {
      const exists = prev.find(o => o.id === option.id);
      if (exists) return prev.filter(o => o.id !== option.id);
      setLatestAddedOption({ name: option.name, description: option.description || option.name });
      return [...prev, option];
    });
  };

  const handleSafetyUpgradeToggle = (option: SafetyUpgradeOption) => {
    setSelectedSafetyUpgrades(prev => {
      const exists = prev.find(o => o.id === option.id);
      if (exists) return prev.filter(o => o.id !== option.id);
      setLatestAddedOption({ name: option.name, description: option.description || option.name });
      return [...prev, option];
    });
  };

  const handleDispensingUnitToggle = (option: DispensingUnitOption) => {
    setSelectedDispensingUnits(prev => {
      const exists = prev.find(o => o.id === option.id);
      if (exists) return prev.filter(o => o.id !== option.id);
      setLatestAddedOption({ name: option.name, description: option.subtext || option.name });
      return [...prev, option];
    });
  };

  const resetConfiguration = () => {
    setSelectedTank(TANK_OPTIONS[0]?.id || '22kl');
    setSelectedReposOsOptions([]);
    setSelectedMechanicalInclusionOptions([]);
    setSelectedDecantation([]);
    setSelectedDispensingUnits([]);
    setSelectedSafetyUnits([]);
    setSelectedSafetyUpgrades([]);
    setSelectedLicenseOptions([]);
    setRfidTagsQuantity(0);
    setPaymentMode('installments');
    setDiscountAmount(0);

    // RFD Z state
    setRfdZBase('datum-2kl');
    setRfdZDispensingUnit('gvr');
    setRfdZUpgrades([]);
  };

  const monthlyTotalPrice = useMemo(() => {
    if (selectedProduct === 'rfd-z') {
      if (paymentMode === 'lease') return 19999;
      if (paymentMode === 'emi') return 49999;
      let price = 0;
      const baseOpt = RFD_Z_BASE_OPTIONS.find(c => c.id === rfdZBase);
      price += baseOpt ? baseOpt.price : 0;
      rfdZUpgrades.forEach(uId => {
        const opt = RFD_Z_UPGRADE_OPTIONS.find(x => x.id === uId);
        price += opt ? opt.price : 0;
      });
      return price;
    } else {
      const tank = TANK_OPTIONS.find(t => t.id === selectedTank);
      const tankPrice = tank ? tank.price : 0;

      let price = tankPrice;
      price += selectedDispensingUnits.reduce((sum, du) => sum + du.price, 0);
      price += selectedReposOsOptions.reduce((total, opt) => total + opt.price, 0);
      price += selectedMechanicalInclusionOptions.reduce((total, totalOpt) => total + totalOpt.price, 0);
      price += selectedDecantation.reduce((total, opt) => total + opt.price, 0);
      price += selectedSafetyUnits.reduce((total, unit) => total + unit.price, 0);
      price += selectedSafetyUpgrades.reduce((total, unit) => {
        if (selectedTank === '30kl' && unit.id === 'advanced-skid') {
          return total;
        }
        return total + unit.price;
      }, 0);
      price += selectedLicenseOptions.reduce((total, opt) => total + opt.price, 0);
      // Add RFID Tags cost: 49 per tag per month
      price += (rfidTagsQuantity * 49);
      return price;
    }
  }, [
    selectedProduct,
    paymentMode,
    selectedTank,
    selectedDispensingUnits,
    selectedReposOsOptions,
    selectedMechanicalInclusionOptions,
    selectedDecantation,
    selectedSafetyUnits,
    selectedSafetyUpgrades,
    selectedLicenseOptions,
    rfidTagsQuantity,
    rfdZBase,
    rfdZUpgrades
  ]);

  const totalContractValue = useMemo(() => {
    if (selectedProduct === 'rfd-z') {
      const baseOpt = RFD_Z_BASE_OPTIONS.find(c => c.id === rfdZBase);
      let base = (baseOpt && baseOpt.totalAmount !== undefined)
        ? baseOpt.totalAmount
        : (baseOpt ? Math.round(baseOpt.price * 36) : (rfdZBase === 'datum-1kl' ? 349999 : 399999));
      let upgradesSum = 0;
      rfdZUpgrades.forEach(uId => {
        const opt = RFD_Z_UPGRADE_OPTIONS.find(x => x.id === uId);
        if (opt) upgradesSum += (opt.totalAmount !== undefined ? opt.totalAmount : Math.round(opt.price * 36));
      });
      return base + upgradesSum;
    }
    return monthlyTotalPrice * 36;
  }, [selectedProduct, monthlyTotalPrice, rfdZBase, rfdZUpgrades]);

  const gstAmount = useMemo(() => {
    return totalContractValue * 0.18;
  }, [totalContractValue]);

  const totalInclTax = useMemo(() => {
    return totalContractValue + gstAmount;
  }, [totalContractValue, gstAmount]);

  const displayPrice = useMemo(() => {
    if (selectedProduct === 'rfd-z') {
      if (paymentMode === 'lease') return 19999;
      if (paymentMode === 'emi') return 49999;
      return totalContractValue;
    }
    if (paymentMode === 'outright') {
      return totalContractValue;
    }
    return monthlyTotalPrice;
  }, [selectedProduct, paymentMode, totalContractValue, monthlyTotalPrice]);

  const showPrices = userRole === 'sales';

  const computedFinalPartcode = useMemo(() => {
    if (selectedProduct !== 'rfd-z') return '';
    const baseOpt = RFD_Z_BASE_OPTIONS.find(o => o.id === rfdZBase);
    let code = baseOpt?.partcode || (rfdZBase === 'datum-1kl' ? 'DATUM1Z' : 'DATUM2Z');

    const duOpt = RFD_Z_DISPENSING_UNITS.find(d => d.id === rfdZDispensingUnit);
    if (duOpt?.partcode) {
      code += duOpt.partcode;
    }

    RFD_Z_UPGRADE_OPTIONS.forEach(opt => {
      if (opt.partcode && rfdZUpgrades.includes(opt.id)) {
        code += opt.partcode;
      }
    });

    if (rfdZUpgrades.length > 0) {
      code += 'K';
    }
    return code;
  }, [selectedProduct, rfdZBase, rfdZDispensingUnit, rfdZUpgrades]);

  const buildCurrentQuoteData = (custDetails: CustomerDetails | null): QuoteData => {
    return {
      customerDetails: custDetails || undefined,
      paymentMode,
      totalPrice: paymentMode === 'outright' ? totalInclTax : displayPrice,
      gstAmount: gstAmount,
      totalContractValue: totalContractValue,
      monthlyPrice: paymentMode === 'installments' ? displayPrice : undefined,
      rfidTagsQuantity,
      discountAmount,
      selectedProduct: selectedProduct,
      finalPartcode: computedFinalPartcode,
      rfdZConfiguration: selectedProduct === 'rfd-z' ? {
        base: rfdZBase,
        dispensingUnit: rfdZDispensingUnit,
        upgrades: rfdZUpgrades,
      } : undefined,
      configuration: {
        tank: selectedTank,
        dispensingUnits: selectedDispensingUnits,
        decantation: selectedDecantation,
        accessories: {
          reposOs: selectedReposOsOptions,
          mechanical: selectedMechanicalInclusionOptions,
          safetyUnits: selectedSafetyUnits,
          safetyUpgrades: selectedSafetyUpgrades,
        },
        licenses: selectedLicenseOptions,
      }
    };
  };

  const handleLeadFormClose = async (details?: CustomerDetails) => {
    setIsLeadFormOpen(false);
    
    if (details) {
      setCustomerDetails(details);
      setSelectedConsumption(details.consumption);
      
      const recId = getRecommendedTankId(details.consumption);
      setRecommendedTankId(recId);

      // Immediately show the Diesel Score Questionnaire after lead form submission
      setIsDieselQuestionnaireOpen(true);
    } else {
      // User closed without submitting
      setPendingQuoteGeneration(false);
    }
  };

  const handleSlideNext = async () => {
    setIsSlideModalOpen(false);
    setCurrentView('app');

    // Check if we need to generate a quote
    if (pendingQuoteGeneration && customerDetails) {
      const quoteData = buildCurrentQuoteData(customerDetails);
      setCurrentQuoteData(quoteData);
      await generateQuotePDF(quoteData);
      logQuoteGeneration(quoteData, activeRepresentative?.email);
      setIsQuoteModalOpen(true);
      setPendingQuoteGeneration(false);
    }
  };

  const handleQuestionnaireComplete = (result: DieselScoreResult) => {
    setDieselScoreResult(result);
    setIsDieselQuestionnaireOpen(false);
    // Show Diesel Score Results Screen after questionnaire is completed
    setIsDieselResultOpen(true);
  };

  const handleQuestionnaireClose = () => {
    setIsDieselQuestionnaireOpen(false);
    setCurrentView('app');

    if (pendingQuoteGeneration && customerDetails) {
      const quoteData = buildCurrentQuoteData(customerDetails);
      setCurrentQuoteData(quoteData);
      generateQuotePDF(quoteData);
      logQuoteGeneration(quoteData, activeRepresentative?.email);
      setIsQuoteModalOpen(true);
      setPendingQuoteGeneration(false);
    }
  };

  const handleDieselResultExit = () => {
    setIsDieselResultOpen(false);
    // The 2 images appear after the final diesel score screen
    setIsSlideModalOpen(true);
  };

  const handleEnterApp = () => {
    setCurrentView('app');
    setActiveCalculator(null);
  };

  if (currentView === 'landing') {
    return (
      <LandingPage 
        onEnterApp={handleEnterApp} 
        onExploreClick={() => setCurrentView('explore')}
        onFaqClick={() => setCurrentView('faq')}
        onReposPayClick={() => setCurrentView('reposPay')}
        onAboutClick={() => setCurrentView('about')}
        onSavingsClick={() => {
          setCurrentView('app');
          setActiveCalculator('savings');
        }}
        onRoiClick={() => {
          setCurrentView('app');
          setActiveCalculator('roi');
        }}
      />
    );
  }

  if (currentView === 'explore') {
    return (
      <ExplorePage 
        onNavigateHome={() => setCurrentView('landing')}
        onNavigateToApp={handleEnterApp}
        onFaqClick={() => setCurrentView('faq')}
        onAboutClick={() => setCurrentView('about')}
      />
    );
  }

  if (currentView === 'faq') {
    return (
      <FaqPage 
        onBack={() => setCurrentView('landing')} 
        onAboutClick={() => setCurrentView('about')}
      />
    );
  }

  if (currentView === 'reposPay') {
    return (
      <ReposPayPage 
        onBack={() => setCurrentView('landing')}
        onNavigateToApp={handleEnterApp}
        onAboutClick={() => setCurrentView('about')}
      />
    );
  }

  if (currentView === 'about') {
    return (
      <AboutUsPage
        onNavigateHome={() => setCurrentView('landing')}
        onNavigateToApp={handleEnterApp}
        onExploreClick={() => setCurrentView('explore')}
        onReposPayClick={() => setCurrentView('reposPay')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-gray-800 relative">
      {isLoginModalOpen && (
        <LoginModal 
          onLogin={handleLogin} 
          onClose={() => setIsLoginModalOpen(false)} 
        />
      )}
      {isLeadFormOpen && (
        <LeadFormModal 
          onSubmit={handleLeadFormClose} 
          loggedInUser={activeRepresentative?.name || loggedInUserId} 
          loggedInUserEmail={activeRepresentative?.email}
          initialData={customerDetails} 
        />
      )}
      <LeadDetailsModal
        isOpen={isLeadDetailsModalOpen}
        onClose={() => setIsLeadDetailsModalOpen(false)}
        activeRepresentativeEmail={activeRepresentative?.email}
      />
      <SlideModal isOpen={isSlideModalOpen} onNext={handleSlideNext} onClose={handleSlideNext} />

      <DieselScoreQuestionnaireModal
        isOpen={isDieselQuestionnaireOpen}
        onComplete={handleQuestionnaireComplete}
        onClose={handleQuestionnaireClose}
      />

      <DieselScoreResultModal
        isOpen={isDieselResultOpen}
        result={dieselScoreResult}
        onClose={handleDieselResultExit}
        onCtaClick={handleDieselResultExit}
      />
      
      <Header 
        navItems={['Home']}
        onSavingsClick={() => setActiveCalculator('savings')}
        onRoiClick={() => setActiveCalculator('roi')} 
        onHomeClick={() => setActiveCalculator(null)}
        rightNavItems={['FAQs']}
        onNavItemClick={(item) => {
            if (item === 'FAQs') setCurrentView('faq');
            if (item === 'Home') {
              setActiveCalculator(null);
              setCurrentView('landing');
            }
        }}
        activeCalculator={activeCalculator}
        onSecretClick={() => setIsDiscountModalOpen(true)}
        onOpenLeadDetails={() => setIsLeadDetailsModalOpen(true)}
        activeRepresentative={activeRepresentative}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogoutClick={handleLogout}
      />
      
      {activeCalculator === 'savings' ? (
        <div className="w-full h-[calc(100vh-72px)] bg-white">
          <iframe 
            src="https://datum-calc-ibv-kappa.vercel.app/#live" 
            className="w-full h-full border-0"
            title="Savings Calculator"
          />
        </div>
      ) : activeCalculator === 'roi' ? (
        <div className="w-full h-[calc(100vh-72px)] bg-white">
          <iframe 
            src="https://repos-rfd-roi-calculator.vercel.app/" 
            className="w-full h-full border-0"
            title="ROI Calculator"
          />
        </div>
      ) : (
        <main className="flex flex-col lg:flex-row">
          <div className="w-full lg:flex-1 lg:h-[calc(100vh-72px)] lg:sticky lg:top-[72px] h-[45vh] min-h-[300px] relative z-0 bg-gray-100">
            <CarVisualizer 
              tank={selectedTank}
              mechanicalOptions={selectedMechanicalInclusionOptions}
              dispensingUnits={selectedDispensingUnits}
              safetyUnits={selectedSafetyUnits}
              safetyUpgrades={selectedSafetyUpgrades}
              decantation={selectedDecantation}
              hasPlatform={showCapacityPreview}

              selectedProduct={selectedProduct}
              rfdZBase={rfdZBase}
              rfdZUpgrades={rfdZUpgrades}
              latestAddedOption={latestAddedOption}
            />
          </div>
          <div className="w-full lg:w-[400px] xl:w-[450px] lg:h-[calc(100vh-72px)] bg-white z-10 flex-shrink-0">
            <Configurator
              customerDetails={customerDetails}
              paymentMode={paymentMode}
              setPaymentMode={setPaymentMode}
              selectedTank={selectedTank}
              setSelectedTank={handleTankChange}
              selectedReposOsOptions={selectedReposOsOptions}
              onReposOsToggle={handleReposOsToggle}
              selectedMechanicalInclusionOptions={selectedMechanicalInclusionOptions}
              onMechanicalInclusionToggle={handleMechanicalInclusionToggle}
              
              selectedDecantation={selectedDecantation}
              onDecantationToggle={handleDecantationToggle}
              
              selectedDispensingUnits={selectedDispensingUnits}
              onDispensingUnitToggle={handleDispensingUnitToggle}
              
              selectedSafetyUnits={selectedSafetyUnits}
              onSafetyUnitToggle={handleSafetyUnitToggle}
              selectedSafetyUpgrades={selectedSafetyUpgrades}
              onSafetyUpgradeToggle={handleSafetyUpgradeToggle}
              selectedLicenseOptions={selectedLicenseOptions}
              
              rfidTagsQuantity={rfidTagsQuantity}
              setRfidTagsQuantity={setRfidTagsQuantity}

              selectedConsumption={selectedConsumption}
              onConsumptionSelect={handleConsumptionSelect}
              
              totalContractValue={totalContractValue}
              gstAmount={gstAmount}
              totalInclTax={totalInclTax}
              finalPrice={displayPrice}
              
              recommendedTankId={recommendedTankId}
              showPrices={showPrices}
              onResetConfiguration={resetConfiguration}
              
              onOpenComparison={() => setIsComparisonModalOpen(true)}
              onOpenQuote={() => {
                if (customerDetails?.name) {
                  const qData = buildCurrentQuoteData(customerDetails);
                  setCurrentQuoteData(qData);
                  logQuoteGeneration(qData, activeRepresentative?.email);
                  setIsQuoteModalOpen(true);
                } else {
                  setPendingQuoteGeneration(true);
                  setIsLeadFormOpen(true);
                }
              }}
              onCalculateRoi={() => setActiveCalculator('roi')}

              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}

              rfdZBase={rfdZBase}
              setRfdZBase={setRfdZBase}
              rfdZDispensingUnit={rfdZDispensingUnit}
              setRfdZDispensingUnit={setRfdZDispensingUnit}
              rfdZUpgrades={rfdZUpgrades}
              onRfdZUpgradeToggle={handleRfdZUpgradeToggle}

              dieselScoreResult={dieselScoreResult}
              onOpenDieselScore={() => setIsDieselResultOpen(true)}
              onOpenDieselQuestionnaire={() => setIsDieselQuestionnaireOpen(true)}
            />
          </div>
        </main>
      )}

      {isComparisonModalOpen && (
        <ComparisonModal onClose={() => setIsComparisonModalOpen(false)} showPrices={showPrices} />
      )}

      {isQuoteModalOpen && currentQuoteData && (
        <QuoteModal
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
          quoteData={currentQuoteData}
          onEditDetails={() => {
            setIsQuoteModalOpen(false);
            setPendingQuoteGeneration(true);
            setIsLeadFormOpen(true);
          }}
        />
      )}

      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Amount (INR)</label>
              <input
                type="number"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-white border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg font-semibold"
                autoFocus
                placeholder="Enter discount amount"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsDiscountModalOpen(false)} 
                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsDiscountModalOpen(false)} 
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
