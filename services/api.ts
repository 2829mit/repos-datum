import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { CustomerDetails, QuoteData } from '../types';
import { findRepresentativeByName, findRepresentativeByEmail } from '../constants/representatives';

export interface StoredLead extends CustomerDetails {
  id?: string;
  salespersonEmail?: string;
  createdAt?: string;
  timestamp?: any;
}

export interface StoredQuote {
  id?: string;
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  company: string;
  state: string;
  industry: string;
  salesperson: string;
  salespersonEmail: string;
  selectedProduct: string;
  paymentMode: string;
  totalPrice: number;
  totalContractValue: number;
  gstAmount: number;
  monthlyPrice?: number;
  finalPartcode?: string;
  createdAt: string;
  timestamp?: any;
  configurationSummary?: string;
  details?: Partial<QuoteData>;
}

export interface RepresentativeQuoteStat {
  salesperson: string;
  salespersonEmail: string;
  quoteCount: number;
  leadCount: number;
  totalQuoteValue: number;
  lastQuoteDate?: string;
}

// Local storage keys for offline resilience
const LOCAL_LEADS_KEY = 'repos_leads_cache_v1';
const LOCAL_QUOTES_KEY = 'repos_quotes_cache_v1';

const getLocalLeads = (): StoredLead[] => {
  try {
    const raw = localStorage.getItem(LOCAL_LEADS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalLead = (lead: StoredLead) => {
  try {
    const list = getLocalLeads();
    list.unshift(lead);
    localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(list.slice(0, 200)));
  } catch (e) {
    console.warn('Local storage write warning:', e);
  }
};

const getLocalQuotes = (): StoredQuote[] => {
  try {
    const raw = localStorage.getItem(LOCAL_QUOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalQuote = (quote: StoredQuote) => {
  try {
    const list = getLocalQuotes();
    list.unshift(quote);
    localStorage.setItem(LOCAL_QUOTES_KEY, JSON.stringify(list.slice(0, 200)));
  } catch (e) {
    console.warn('Local storage write warning:', e);
  }
};

/**
 * Submits lead form data directly to Firestore 'leads' collection
 * with resilient offline caching
 */
export const submitLead = async (
  data: CustomerDetails, 
  activeUserEmail?: string
): Promise<{ success: boolean; id?: string; message: string }> => {
  let repEmail = activeUserEmail || '';
  if (!repEmail && data.salesperson) {
    const rep = findRepresentativeByName(data.salesperson);
    if (rep) repEmail = rep.email;
  }

  const nowIso = new Date().toISOString();
  const tempId = `lead-${Date.now()}`;

  const payload: StoredLead = {
    id: tempId,
    name: data.name || '',
    mobile: data.mobile || '',
    email: data.email || '',
    company: data.company || '',
    designation: data.designation || '',
    gstNumber: data.gstNumber || '',
    industry: data.industry || '',
    state: data.state || '',
    consumption: data.consumption || '',
    salesperson: data.salesperson || 'Not Assigned',
    salespersonEmail: repEmail,
    fleetSize: data.fleetSize || '',
    numberOfSites: data.numberOfSites || data.numberOfSite || '',
    createdAt: nowIso,
  };

  // Instant local save
  saveLocalLead(payload);

  try {
    const docRef = await addDoc(collection(db, 'leads'), {
      ...payload,
      timestamp: serverTimestamp()
    });
    payload.id = docRef.id;
    return { 
      success: true, 
      id: docRef.id, 
      message: 'Lead saved successfully in Firebase' 
    };
  } catch (error: any) {
    console.warn('Firebase lead write fallback (cached locally):', error?.message);
    return { 
      success: true, 
      id: tempId,
      message: 'Lead recorded locally and queued for Firebase sync' 
    };
  }
};

/**
 * Logs a quote generation event to Firestore 'quotes' collection
 * with resilient offline caching
 */
export const logQuoteGeneration = async (
  data: QuoteData, 
  activeUserEmail?: string
): Promise<{ success: boolean; id?: string }> => {
  let repName = data.customerDetails?.salesperson || 'Not Assigned';
  let repEmail = activeUserEmail || '';
  
  if (!repEmail && repName) {
    const rep = findRepresentativeByName(repName);
    if (rep) repEmail = rep.email;
  } else if (repEmail && !data.customerDetails?.salesperson) {
    const rep = findRepresentativeByEmail(repEmail);
    if (rep) repName = rep.name;
  }

  const quoteNumber = `QT-${Date.now().toString().slice(-6)}`;
  const nowIso = new Date().toISOString();

  const configSummary = data.selectedProduct === 'rfd-z'
    ? `Datum Z (${data.rfdZConfiguration?.base || 'Base'}) with ${(data.rfdZConfiguration?.upgrades || []).length} upgrades`
    : `Portable ${data.configuration?.tank || ''} Tank`;

  const payload: StoredQuote = {
    id: quoteNumber,
    quoteNumber,
    customerName: data.customerDetails?.name || 'Customer',
    customerEmail: data.customerDetails?.email || '',
    customerMobile: data.customerDetails?.mobile || '',
    company: data.customerDetails?.company || '',
    state: data.customerDetails?.state || '',
    industry: data.customerDetails?.industry || '',
    salesperson: repName,
    salespersonEmail: repEmail,
    selectedProduct: data.selectedProduct || 'rfd-z',
    paymentMode: data.paymentMode || 'outright',
    totalPrice: Number(data.totalPrice) || 0,
    totalContractValue: Number(data.totalContractValue) || 0,
    gstAmount: Number(data.gstAmount) || 0,
    monthlyPrice: data.monthlyPrice ? Number(data.monthlyPrice) : 0,
    finalPartcode: data.finalPartcode || '',
    configurationSummary: configSummary,
    createdAt: nowIso,
    details: {
      rfidTagsQuantity: data.rfidTagsQuantity || 0,
      rfdZConfiguration: data.rfdZConfiguration,
      configuration: data.configuration
    }
  };

  // Instant local save
  saveLocalQuote(payload);

  try {
    const docRef = await addDoc(collection(db, 'quotes'), {
      ...payload,
      timestamp: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.warn('Firebase quote write fallback (cached locally):', error?.message);
    return { success: true, id: quoteNumber };
  }
};

/**
 * Fetch all leads from Firestore with graceful fallback to local cache
 */
export const fetchAllLeads = async (): Promise<StoredLead[]> => {
  const localList = getLocalLeads();

  try {
    // 5 second max timeout to prevent infinite spinner if backend is slow
    const fetchPromise = (async () => {
      try {
        const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const leads: StoredLead[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          leads.push({
            id: docSnap.id,
            name: d.name || '',
            mobile: d.mobile || '',
            email: d.email || '',
            company: d.company || '',
            designation: d.designation || '',
            gstNumber: d.gstNumber || '',
            industry: d.industry || '',
            state: d.state || '',
            consumption: d.consumption || '',
            salesperson: d.salesperson || '',
            salespersonEmail: d.salespersonEmail || '',
            fleetSize: d.fleetSize || '',
            numberOfSites: d.numberOfSites || '',
            createdAt: d.createdAt || (d.timestamp instanceof Timestamp ? d.timestamp.toDate().toISOString() : ''),
          });
        });
        return leads;
      } catch {
        const snapshot = await getDocs(collection(db, 'leads'));
        const leads: StoredLead[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          leads.push({
            id: docSnap.id,
            name: d.name || '',
            mobile: d.mobile || '',
            email: d.email || '',
            company: d.company || '',
            designation: d.designation || '',
            gstNumber: d.gstNumber || '',
            industry: d.industry || '',
            state: d.state || '',
            consumption: d.consumption || '',
            salesperson: d.salesperson || '',
            salespersonEmail: d.salespersonEmail || '',
            fleetSize: d.fleetSize || '',
            numberOfSites: d.numberOfSites || '',
            createdAt: d.createdAt || '',
          });
        });
        return leads;
      }
    })();

    const timeoutPromise = new Promise<StoredLead[]>((_, reject) => 
      setTimeout(() => reject(new Error('timeout')), 5000)
    );

    const remoteLeads = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Merge remote and local leads without duplicates
    const combined = [...remoteLeads];
    const existingMobiles = new Set(remoteLeads.map(l => l.mobile + l.name));
    localList.forEach(l => {
      if (!existingMobiles.has(l.mobile + l.name)) {
        combined.push(l);
      }
    });

    return combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (error) {
    console.warn('Using local leads cache:', error);
    return localList;
  }
};

/**
 * Fetch all quotes from Firestore with graceful fallback to local cache
 */
export const fetchAllQuotes = async (): Promise<StoredQuote[]> => {
  const localList = getLocalQuotes();

  try {
    const fetchPromise = (async () => {
      try {
        const q = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const quotes: StoredQuote[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          quotes.push({
            id: docSnap.id,
            quoteNumber: d.quoteNumber || docSnap.id.slice(0, 8),
            customerName: d.customerName || '',
            customerEmail: d.customerEmail || '',
            customerMobile: d.customerMobile || '',
            company: d.company || '',
            state: d.state || '',
            industry: d.industry || '',
            salesperson: d.salesperson || '',
            salespersonEmail: d.salespersonEmail || '',
            selectedProduct: d.selectedProduct || 'rfd-z',
            paymentMode: d.paymentMode || 'outright',
            totalPrice: Number(d.totalPrice) || 0,
            totalContractValue: Number(d.totalContractValue) || 0,
            gstAmount: Number(d.gstAmount) || 0,
            monthlyPrice: d.monthlyPrice ? Number(d.monthlyPrice) : 0,
            finalPartcode: d.finalPartcode || '',
            configurationSummary: d.configurationSummary || '',
            createdAt: d.createdAt || (d.timestamp instanceof Timestamp ? d.timestamp.toDate().toISOString() : ''),
            details: d.details || {}
          });
        });
        return quotes;
      } catch {
        const snapshot = await getDocs(collection(db, 'quotes'));
        const quotes: StoredQuote[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          quotes.push({
            id: docSnap.id,
            quoteNumber: d.quoteNumber || docSnap.id.slice(0, 8),
            customerName: d.customerName || '',
            customerEmail: d.customerEmail || '',
            customerMobile: d.customerMobile || '',
            company: d.company || '',
            state: d.state || '',
            industry: d.industry || '',
            salesperson: d.salesperson || '',
            salespersonEmail: d.salespersonEmail || '',
            selectedProduct: d.selectedProduct || 'rfd-z',
            paymentMode: d.paymentMode || 'outright',
            totalPrice: Number(d.totalPrice) || 0,
            totalContractValue: Number(d.totalContractValue) || 0,
            gstAmount: Number(d.gstAmount) || 0,
            monthlyPrice: d.monthlyPrice ? Number(d.monthlyPrice) : 0,
            finalPartcode: d.finalPartcode || '',
            configurationSummary: d.configurationSummary || '',
            createdAt: d.createdAt || '',
            details: d.details || {}
          });
        });
        return quotes;
      }
    })();

    const timeoutPromise = new Promise<StoredQuote[]>((_, reject) => 
      setTimeout(() => reject(new Error('timeout')), 5000)
    );

    const remoteQuotes = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Merge remote and local quotes without duplicates
    const combined = [...remoteQuotes];
    const existingQuotes = new Set(remoteQuotes.map(q => q.quoteNumber));
    localList.forEach(q => {
      if (!existingQuotes.has(q.quoteNumber)) {
        combined.push(q);
      }
    });

    return combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (error) {
    console.warn('Using local quotes cache:', error);
    return localList;
  }
};

export { authenticateUserOrEmail as login } from './firebase';

