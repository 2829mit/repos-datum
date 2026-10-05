
import type { PerformanceSpec, IotOption, TankOption, AccessoryOption, DispensingUnitOption, SafetyUpgradeOption, LicenseOption } from './types';

// Removed static BASE_PRICE as it is now determined by the selected Tank
export const BASE_FINANCE_PER_MONTH = 0; // Not used in new logic

const commonSpecs: PerformanceSpec[] = [
  { value: '120L/m', label: 'Speed' },
  { value: '100%', label: 'Tracking' },
  { value: '24/7', label: 'Monitoring' },
];

// Renamed and Updated Dispensing Unit Options
export const DISPENSING_UNIT_OPTIONS: DispensingUnitOption[] = [
  { id: 'single-du', name: 'Single DU', subtext: '2 Nozzle with Active Readers', price: 0 }, 
  { id: 'basic-skid-dispensing', name: 'Basic Skid', subtext: '', price: 0 },
  // Removed Additional DU from here
  { id: 'filtration-mechanism', name: 'Filtration Mechanism', subtext: '', price: 0 },
  { id: 'flame-proof-illumination', name: 'Flame Proof Illumination', subtext: '', price: 0 },
  { id: 'glasswool-shield', name: 'Glasswool Shield', subtext: '', price: 0 },
];

export const REPOS_OS_OPTIONS: AccessoryOption[] = [
  { id: 'reports-analytics', name: 'Reports & Analytics', price: 0 },
  { id: 'operator-manager-apps', name: 'Operator & Manager Apps', price: 0 },
  { id: 'real-time-inventory', name: 'Real-time Fuel Level Inventory', price: 0 },
  { id: 'erp-integration', name: 'ERP Integration', price: 2999 }, 
];

export const DECANTATION_OPTIONS: IotOption[] = [
  { id: 'basic-skid', name: 'Basic Skid', subtext: 'Without Metering Counter', price: 0 },
];

export const MECHANICAL_INCLUSION_OPTIONS: AccessoryOption[] = [
  { 
    id: 'dual-walled-tank', 
    name: 'Dual Walled Tank', 
    price: 0,
    infoImageUrl: 'https://res.cloudinary.com/dt8jmqu8d/image/upload/v1764951511/Double_walled_tank_r7u9hb.png',
    description: 'Double-walled construction ensures zero leakage and provides an extra layer of environmental protection and safety compliance.'
  },
  { id: 'iso-certified-frame', name: 'ISO Container Frame', price: 0 },
  { id: 'peso-manhole', name: 'PESO Approved Manhole Assembly', price: 0 },
  { id: 'weather-proof-canopy', name: 'Weather Proof Modular Canopy', price: 0 },
  { id: 'ss-pipeline', name: 'Stainless Steel Pipeline', price: 0 },
  { id: 'galvanized-surface', name: 'Rustfree Surface Treatment', price: 0 },
];

export const SAFETY_UNIT_OPTIONS: AccessoryOption[] = [
  { 
    id: 'fuel-level-sensors', 
    name: 'Fuel Level Sensors', 
    price: 0,
    infoImageUrl: 'https://res.cloudinary.com/dt8jmqu8d/image/upload/v1764951508/RATG_sensor_pe2a55.png',
    description: 'High-precision ATG (Automatic Tank Gauge) sensors for real-time fuel inventory monitoring and leak detection.'
  }, 
  {
    id: 'leak-detection-system',
    name: 'Leak Detection System',
    price: 0,
    infoImageUrl: 'https://res.cloudinary.com/dt8jmqu8d/image/upload/v1764177461/Screenshot_2025-11-26_224724_kbhepo.png',
    description: 'Precision sensors monitor double-walled tank integrity 24/7. Any breach triggers an immediate system alert.'
  },
  { 
    id: 'overfill-sensors', 
    name: 'Overfill Sensors', 
    price: 0,
    infoImageUrl: 'https://res.cloudinary.com/dt8jmqu8d/image/upload/v1764951500/Overfill_sensor_bfxzo6.png',
    description: 'Advanced safety sensors that automatically shut off the pump to prevent accidental overfilling during fuel replenishment.'
  },
  { id: 'iot-controller-safety', name: 'IOT Controller', price: 0 },
  { id: 'mobile-device', name: 'Wireless Synchronised Mobile', price: 0 },
];

export const SAFETY_UPGRADE_OPTIONS: SafetyUpgradeOption[] = [
  { 
    id: 'crash-barrier', 
    name: 'Crash Barrier', 
    price: 5499, 
    imageUrl: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/compressor_aws/ShortPixelOptimized/3.png', 
    description: 'Reinforced protective barriers engineered to safeguard the station against vehicular impact and ensure operational safety.'
  },
  { 
    id: 'fire-suppression', 
    name: 'Fire Suppression System', 
    price: 2999, 
    imageUrl: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/compressor_aws/ShortPixelOptimized/2.png', 
    description: 'Safety-focused package featuring an integrated fire extinguisher for emergency situations.'
  },
  { 
    id: 'advanced-skid', 
    name: 'Advanced Decanting Skid', 
    price: 9999, 
    imageUrl: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/compressor_aws/final/-7-10-Advanced%20Skid-%20Flowmeter-common-min.png',
    description: 'A Flow Meter is a high-precision instrument used to measure the volume of fuel being unloaded (decanted) into the station. It ensures accurate quantity verification, transparency, and prevents pilferage during the refilling process.'
  },
  { 
    id: 'backup-du', 
    name: 'Additional DU', 
    price: 4999, 
    imageUrl: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/compressor_aws/final/-4-3-DU%20with%20rfid2-common-min.png',
    description: 'Standard Nozzle for additional dispensing requirements.'
  },
  { 
    id: 'sampling-kit', 
    name: 'Sampling Kit', 
    price: 0, 
    imageUrl: 'https://drf-media-data.s3.ap-south-1.amazonaws.com/compressor_aws/final/-6-4b-Filteration%20mechanism-option-common-min.png',
    description: 'Essential kit for fuel quality sampling and testing.'
  },
];

export const LICENSE_OPTIONS: LicenseOption[] = [
  { id: 'drawing-layout', name: 'Drawing Layout Creation', price: 0, subtext: 'Scope Repos' },
  { id: 'prior-approval', name: 'Prior Approval', price: 0, subtext: 'Scope Repos' },
  { id: 'dm-noc', name: 'DM NOC', price: 0, subtext: 'Scope Customer' },
  { id: 'final-grant', name: 'Final Grant Form 14', price: 0, subtext: 'Scope Repos' },
];

export const TANK_OPTIONS: TankOption[] = [
  // { id: '22kl', name: '22KL', price: 99999, dimensions: '10.5 x 4.5 x 4.5 meters' },
  { id: '30kl', name: '30KL', price: 119999, dimensions: '12 x 4.5 x 4.5 meters' },
  // { id: '45kl', name: '45KL', price: 129999, dimensions: '15 x 4.5 x 4.5 meters' },
  { id: '60kl', name: '60KL', price: 139999, dimensions: '18 x 4.5 x 4.5 meters' },
];

export const CONSUMPTION_OPTIONS: string[] = [
  '5KL to 10KL',
  '10KL to 20KL',
  '20KL to 50KL',
  'More than 50KL',
];

export const DESIGNATION_OPTIONS: string[] = [
  'Owner',
  'Site Manager',
  'Operator',
  'Procurement Manager',
  'Purchase Manager',
  'Operations Manager',
  'Store Manager',
  'Admin',
  'CEO/MD',
];

export interface RfdOption {
  id: string;
  name: string;
  price: number;
  displayPrice?: string;
  description?: string;
  partcode?: string;
  category?: 'modification' | 'addon';
  featureQuoteText?: string;
  pricingQuoteText?: string;
  totalAmount?: number;
}

export interface RfdUpgradeOption extends RfdOption {
  category: 'modification' | 'addon';
  featureQuoteText: string;
  pricingQuoteText: string;
  totalAmount: number;
}

export const RFD_Z_BASE_OPTIONS: RfdOption[] = [
  { id: 'datum-1kl', name: 'DATUM Z 1KL', price: 349999 / 36, totalAmount: 349999, partcode: 'DATUM1Z' },
  { id: 'datum-2kl', name: 'Datum Z 2KL', price: 399999 / 36, totalAmount: 399999, partcode: 'DATUM2Z' }
];

export const RFD_Z_DISPENSING_UNITS: { id: string; name: string; description?: string; partcode?: string }[] = [
  { id: 'gvr', name: 'GVR', description: 'Gilbarco Veeder-Root dispensing unit', partcode: 'GVR' },
  { id: 'tokheim', name: 'Tokheim', description: 'Tokheim dispensing unit', partcode: 'TKM' }
];

export const RFD_Z_UPGRADE_OPTIONS: RfdUpgradeOption[] = [
  { 
    id: 'fuel-monitoring', 
    name: 'Fuel Monitoring system', 
    price: 50000 / 36,
    totalAmount: 50000,
    description: 'Live fuel level system for control on fuel movement',
    partcode: 'FMS',
    category: 'modification',
    featureQuoteText: '• Fuel Monitoring System: for live fuel tracking via sensors to track how much is available',
    pricingQuoteText: '• Fuel Monitoring System - ₹50,000'
  },
  { 
    id: 'safety-security', 
    name: 'Safety & Security', 
    price: 35000 / 36,
    totalAmount: 35000,
    description: 'Auto-fire detection and in-built extinguishing suppression system, with CCTV camera for video recordings of every transaction done',
    partcode: 'SS',
    category: 'modification',
    featureQuoteText: '• Safety & Security System: for ensuring fire safety and security through cameras',
    pricingQuoteText: '• Safety & Security System - ₹35,000'
  },
  {
    id: 'secure-fueling',
    name: 'Secure Fueling System',
    price: 50000 / 36,
    totalAmount: 50000,
    description: 'Advanced fuel security system with encrypted locks and authorization to prevent theft and unauthorized fueling.',
    partcode: 'SF',
    category: 'modification',
    featureQuoteText: '• Secure Fuelling System: RFID based checks to detect theft',
    pricingQuoteText: '• Secure Fuelling System - ₹50,000'
  },
  { 
    id: 'lm-stamping', 
    name: 'LM Stamping & Calibration Kit', 
    price: 25000 / 36,
    totalAmount: 25000,
    description: 'Dispensing Unit approved and calibrated through Legal Metrology for accurate dispensing to measure right quality & quantity, along with a Q&Q kit for future self-calibration',
    partcode: 'LM',
    category: 'addon',
    featureQuoteText: '• Legal Metrology: calibrated & stamped dispensers',
    pricingQuoteText: '• Legal Metrology - ₹25,000'
  },
  { 
    id: 'transportation', 
    name: 'Forwarding & Transportation', 
    price: 20000 / 36,
    totalAmount: 20000,
    description: 'At actuals, recommended in customer scope',
    category: 'addon',
    featureQuoteText: '• Forwarding & Transportation',
    pricingQuoteText: '• Forwarding & Transportation - ₹20,000'
  },
  { 
    id: 'packing-forwarding', 
    name: 'Commissioning', 
    price: 20000 / 36,
    totalAmount: 20000,
    description: 'Tight packaging with wooden crating and corrugated box for shield coverage, with commissioning',
    category: 'addon',
    featureQuoteText: '• Commissioning',
    pricingQuoteText: '• Commissioning - ₹20,000'
  }
];

export const RFD_Z_MODIFICATION_FEATURES: RfdUpgradeOption[] = RFD_Z_UPGRADE_OPTIONS.filter(o => o.category === 'modification');
export const RFD_Z_ADDONS: RfdUpgradeOption[] = RFD_Z_UPGRADE_OPTIONS.filter(o => o.category === 'addon');

export interface TermItem {
  prefix: string;
  title: string;
  content: string;
}

export const TERMS_AND_CONDITIONS: TermItem[] = [
  {
    prefix: 'A.',
    title: 'USE:',
    content: 'The Repos Fuel Datum (“RFD”) is for internal business use of storing and dispensing high speed diesel only (in line with approval from PESO) and the RFD shall not be used for any other purpose. Customer shall not use RFD for refueling any third party vehicle or for the purpose of reselling of high speed diesel to any third party vehicle; since such use of RFD will be in contravention of Motor Spirit And High Speed Diesel (Regulation Of Supply, Distribution And Prevention Of Malpractices) Order, 2005 as amended from time to time, for which the only Customer will be liable.'
  },
  {
    prefix: 'B.',
    title: 'WORK ORDER:',
    content: 'The Customer shall place the order only in the name of Repos Energy India Private Limited (“The Company”). Any discrepancy in the name shall result in cancellation of order. Upon initiation of the work order, no modification regarding RFD variant model or any other related upgrades will be accepted.'
  },
  {
    prefix: 'C.',
    title: 'TITLE TRANSFER & DELIVERY:',
    content: 'RFD shall be ready for delivery at Delivery Location (defined hereunder) within twelve (4-5) weeks from the date of execution of the purchase order, subject to the fulfilment of payment terms mentioned in Point D. The title of the said RFD shall stand transferred from Repos Energy India Private Limited (hereinafter referred to as "Repos") to the Customer upon dispatch of the said RFD from Repos\' manufacturing facility situated at Chakan, Pune, Maharashtra, India. Upon such transfer of title, save and except as expressly provided herein, all obligations pertaining to the RFD shall stand transferred from Repos to the Customer, and Repos shall stand discharged from all obligations relating to the RFD, except those explicitly specified herein. Subsequent to the transfer of title, the Customer shall be solely responsible and liable for any non-compliance or deviation from the Standard Operating Procedures (SOPs), regulations promulgated by relevant authorities, and statutory compliances prescribed by the Petroleum and Explosives Safety Organization (PESO), Oil Marketing Companies (OMCs), or any other concerned regulatory or governing bodies. Repos shall, on a best effort basis, undertake the installation of the RFD within fifteen (15) business days from the date of dispatch subject to the site readiness, which timeline is indicative and shall not be construed as a mandatory obligation upon Repos.'
  },
  {
    prefix: 'D.',
    title: 'PAYMENT TERMS:',
    content: 'Payment shall be made by the Customer to Repos As per the agreed schedule. The dispatch shall be scheduled only after the complete payment is received by Repos. The said dispatch of RFD would be in accordance with Ex-Workshop (EXW) basis at Waki, Chakan Pune (Maharashtra). Repos shall make the RFD available for collection by the Buyer on an EXW basis from Repos’ facility located in Waki, Chakan, Pune, Maharashtra ("Delivery Location") and the Customer shall be solely responsible for all costs, risks, and liabilities associated with transportation, loading, insurance and any other expenses incurred after the goods have been made available at the Delivery Location. Upon notification of readiness for pickup, Customer shall take delivery within seven (7) days, failing which storage charges may apply at the Repos’ discretion. Title and risk in the goods shall pass to the Buyer upon collection from the Delivery Location read with Point C TITLE TRANSFER & DELIVERY above'
  },
  {
    prefix: 'E.',
    title: 'PAYMENT OF GOODS & SERVICE TAX (GST):',
    content: 'GST will be applicable on RFD at prevailing rates at the time of dispatch & GST rate is subject to change, any revisions will automatically be applied.'
  },
  {
    prefix: 'F.',
    title: 'INSPECTION:',
    content: 'Prior to dispatch, RFD shall be inspected by the Inspection Team and/or the Customer or its authorized representative to ensure compliance with the agreed specifications and quality standards. The inspection shall take place at the Repos’ facility, and the Customer shall have the right to verify RFD’s condition before acceptance. Any concerns or discrepancies identified during the inspection shall be addressed before shipment.'
  },
  {
    prefix: 'G.',
    title: 'WARRANTY:',
    content: 'The RFD is covered under a twelve (12) month warranty from the date of Invoice, against manufacturing and craftsmanship defects. This warranty does not cover any damages resulting from mishandling, physical damage due to accidents, operator negligence, improper maintenance, unauthorized modifications, or repairs attempted by any third party other than authorized representatives of Repos. Once the RFD has been dispatched from Repos\' facility or title has been transferred, Repos shall not be liable for any loss or damage.'
  },
  {
    prefix: 'H.',
    title: 'CUSTOMER SCOPE:',
    content: '1. Civil & Electrical Work: Any civil, electrical,stabilizer , overhead shed , solid foundation  or additional work required for the installation and functioning of the RFD shall be the sole responsibility of the Customer.\n\n2. Fraudulent Activities: Repos shall not be liable for any fraudulent activities conducted by the Customer in connection with any services provided through RFD.\n\n3. Additional Costs: The Customer shall bear all costs related to: a) transportation of RFD; b) Insurance; c) nozzle or any other yearly renewals;\n\n4. Unloading Responsibility: The Customer shall be responsible for unloading RFD at their designated site.\n\n5. Cancellation after invoicing incurs a cancellation fee of 50% of invoice value and cancellation after Purchase order or payment before invoicing will attract cancellation fee of INR 50,000.'
  },
  {
    prefix: 'I.',
    title: 'INTELLECTUAL PROPERTIES (“IP”):',
    content: 'All intellectual properties and proprietary technology of Company remains absolute property of the Company and under no condition the Customer shall have any right on the IP. The Customer shall not copy or reverse-engineer the RMD or any software.'
  },
  {
    prefix: 'J.',
    title: 'APPLICABILITY OF TERMS AND CONDITIONS:',
    content: 'Unless otherwise expressly agreed in writing, these Terms and Conditions shall apply to all contracts, and engagements between Customer and Repos for the sale of RFD and all related services provided by Repos, into which contracts are incorporated by reference'
  }
];

export interface BankAccountDetails {
  accountNumber: string;
  beneficiaryName: string;
  bankName: string;
  branch: string;
  ifscCode: string;
}

export const BANK_ACCOUNT_DETAILS: BankAccountDetails = {
  accountNumber: '777705029009',
  beneficiaryName: 'Repos Energy India Private Limited',
  bankName: 'ICICI Bank',
  branch: 'Shivajinagar, Pune',
  ifscCode: 'ICIC0000039'
};

export const REPOS_COMPANY_FOOTER = {
  name: 'REPOS ENERGY INDIA PRIVATE LIMITED',
  address: '103, Kumar Vastu, Co-op. Housing Society Ltd, Opp. Symphony Hotel, Bhosalenagar, Pune-411020',
  cinGst: 'CIN: U74999PN2017PTC170768 | GST: 27AAICR3322D1ZO',
  website: 'www.reposenergy.com',
  email: 'support@reposenergy.com',
  phone: '+91-99229 19009'
};

