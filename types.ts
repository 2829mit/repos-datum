
import type { DieselScoreResult } from './utils/dieselScore';

export interface PerformanceSpec {
  value: string;
  label: string;
}

export interface AccessoryOption {
  id: string;
  name: string;
  price: number;
  infoImageUrl?: string; // Added field for info popup image
  description?: string; // Added field for info popup text
}

export interface IotOption {
  id: string;
  name: string;
  price: number;
  subtext: string;
  description?: string;
  imageUrl?: string;
}

export interface TankOption {
  id: string;
  name: string;
  price: number;
  dimensions?: string;
}

export interface LicenseOption {
  id: string;
  name: string;
  price: number;
  isCompulsory?: boolean;
  subtext?: string;
}

export interface DispensingUnitOption {
  id: string;
  name: string;
  subtext: string;
  price: number;
}

export interface SafetyUpgradeOption extends AccessoryOption {
  imageUrl: string;
  description?: string;
}

export interface CustomerDetails {
  name: string;
  mobile: string;
  email: string;
  company: string;
  industry: string;
  state: string;
  consumption: string;
  salesperson: string;
  fleetSize?: string;
  numberOfSites?: string;
  numberOfSite?: string;
  designation?: string;
  gstNumber?: string;
}

export interface QuoteData {
  customerDetails: CustomerDetails;
  paymentMode: 'outright' | 'installments' | 'lease' | 'emi';
  totalPrice: number;
  gstAmount: number;
  totalContractValue: number;
  monthlyPrice?: number;
  rfidTagsQuantity?: number;
  discountAmount?: number;
  dieselScoreResult?: DieselScoreResult;
  selectedProduct?: 'rfd-portable' | 'rfd-z';
  finalPartcode?: string;
  rfdZConfiguration?: {
    base: string;
    dispensingUnit?: string;
    upgrades: string[];
  };
  configuration: {
    tank: string;
    dispensingUnits: DispensingUnitOption[];
    decantation: IotOption[]; // Changed from IotOption | null to IotOption[]
    accessories: {
      reposOs: AccessoryOption[];
      mechanical: AccessoryOption[];
      safetyUnits: AccessoryOption[];
      safetyUpgrades: SafetyUpgradeOption[];
    };
    licenses: LicenseOption[];
  };
}
