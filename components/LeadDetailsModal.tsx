import React, { useState, useEffect, useMemo } from 'react';
import { fetchAllLeads, fetchAllQuotes, StoredLead, StoredQuote } from '../services/api';
import { REPOS_REPRESENTATIVES } from '../constants/representatives';

interface LeadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRepresentativeEmail?: string | null;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'leads' | 'quotes'>('analytics');
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [quotes, setQuotes] = useState<StoredQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [repFilter, setRepFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<StoredLead | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<StoredQuote | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsData, quotesData] = await Promise.all([
        fetchAllLeads(),
        fetchAllQuotes(),
      ]);
      setLeads(leadsData);
      setQuotes(quotesData);
    } catch (err) {
      console.error('Failed to load Firestore data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  // Analytics Computation
  const repStats = useMemo(() => {
    // Map reps
    const statsMap = new Map<string, {
      name: string;
      email: string;
      quoteCount: number;
      leadCount: number;
      totalQuoteValue: number;
      lastDate?: string;
    }>();

    // Initialize with all predefined reps
    REPOS_REPRESENTATIVES.forEach(r => {
      statsMap.set(r.email.toLowerCase(), {
        name: r.name,
        email: r.email,
        quoteCount: 0,
        leadCount: 0,
        totalQuoteValue: 0
      });
    });

    // Populate quotes
    quotes.forEach(q => {
      const repKey = (q.salespersonEmail || '').toLowerCase();
      let entry = statsMap.get(repKey);
      if (!entry && q.salesperson) {
        // Try match by name
        for (const [, val] of statsMap) {
          if (val.name.toLowerCase() === q.salesperson.toLowerCase()) {
            entry = val;
            break;
          }
        }
      }
      if (!entry) {
        // Unknown or custom rep
        const key = repKey || q.salesperson.toLowerCase();
        entry = {
          name: q.salesperson || 'Unassigned',
          email: q.salespersonEmail || 'N/A',
          quoteCount: 0,
          leadCount: 0,
          totalQuoteValue: 0
        };
        statsMap.set(key, entry);
      }

      entry.quoteCount += 1;
      entry.totalQuoteValue += (q.totalPrice || q.totalContractValue || 0);
      if (!entry.lastDate || new Date(q.createdAt) > new Date(entry.lastDate)) {
        entry.lastDate = q.createdAt;
      }
    });

    // Populate leads
    leads.forEach(l => {
      const repKey = (l.salespersonEmail || '').toLowerCase();
      let entry = statsMap.get(repKey);
      if (!entry && l.salesperson) {
        for (const [, val] of statsMap) {
          if (val.name.toLowerCase() === l.salesperson.toLowerCase()) {
            entry = val;
            break;
          }
        }
      }
      if (entry) {
        entry.leadCount += 1;
      }
    });

    return Array.from(statsMap.values()).sort((a, b) => b.quoteCount - a.quoteCount || b.leadCount - a.leadCount);
  }, [leads, quotes]);

  const totalPipeline = useMemo(() => {
    return quotes.reduce((acc, q) => acc + (q.totalPrice || q.totalContractValue || 0), 0);
  }, [quotes]);

  const activeRepsCount = useMemo(() => {
    return repStats.filter(r => r.quoteCount > 0 || r.leadCount > 0).length;
  }, [repStats]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = 
        !searchQuery ||
        l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.mobile?.includes(searchQuery) ||
        l.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.salesperson?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRep = 
        repFilter === 'all' ||
        l.salesperson === repFilter ||
        l.salespersonEmail?.toLowerCase() === repFilter.toLowerCase();

      return matchesSearch && matchesRep;
    });
  }, [leads, searchQuery, repFilter]);

  // Filtered Quotes
  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => {
      const matchesSearch = 
        !searchQuery ||
        q.quoteNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.customerMobile?.includes(searchQuery) ||
        q.salesperson?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRep = 
        repFilter === 'all' ||
        q.salesperson === repFilter ||
        q.salespersonEmail?.toLowerCase() === repFilter.toLowerCase();

      return matchesSearch && matchesRep;
    });
  }, [quotes, searchQuery, repFilter]);

  // CSV Export for Leads
  const exportLeadsCsv = () => {
    if (leads.length === 0) return;
    const headers = ['Created At', 'Name', 'Mobile', 'Email', 'Company', 'Designation', 'Industry', 'State', 'Consumption', 'Representative', 'Rep Email', 'Sites', 'GST'];
    const rows = leads.map(l => [
      `"${l.createdAt || ''}"`,
      `"${l.name || ''}"`,
      `"${l.mobile || ''}"`,
      `"${l.email || ''}"`,
      `"${l.company || ''}"`,
      `"${l.designation || ''}"`,
      `"${l.industry || ''}"`,
      `"${l.state || ''}"`,
      `"${l.consumption || ''}"`,
      `"${l.salesperson || ''}"`,
      `"${l.salespersonEmail || ''}"`,
      `"${l.numberOfSites || ''}"`,
      `"${l.gstNumber || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `repos_leads_bulk_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export for Quotes
  const exportQuotesCsv = () => {
    if (quotes.length === 0) return;
    const headers = ['Created At', 'Quote No', 'Customer Name', 'Mobile', 'Email', 'Company', 'State', 'Product', 'Payment Mode', 'Partcode', 'Total Excl GST', 'GST Amount', 'Total Incl GST', 'Representative', 'Rep Email'];
    const rows = quotes.map(q => [
      `"${q.createdAt || ''}"`,
      `"${q.quoteNumber || ''}"`,
      `"${q.customerName || ''}"`,
      `"${q.customerMobile || ''}"`,
      `"${q.customerEmail || ''}"`,
      `"${q.company || ''}"`,
      `"${q.state || ''}"`,
      `"${q.selectedProduct || ''}"`,
      `"${q.paymentMode || ''}"`,
      `"${q.finalPartcode || ''}"`,
      `"${q.totalContractValue || 0}"`,
      `"${q.gstAmount || 0}"`,
      `"${q.totalPrice || 0}"`,
      `"${q.salesperson || ''}"`,
      `"${q.salespersonEmail || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `repos_quotes_bulk_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Repos Analytics & Bulk Data Hub</h2>
              <p className="text-xs sm:text-sm text-slate-300">Live Firebase database records: Leads, Quotes & Representative Performance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-sm"
              title="Refresh records from Firebase"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Controls */}
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-gray-200 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Representative Analytics</span>
              <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {quotes.length} quotes
              </span>
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'leads'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Bulk Leads View</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {leads.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('quotes')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'quotes'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Bulk Quotes View</span>
              <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {quotes.length}
              </span>
            </button>
          </div>

          {/* Action buttons (Export) */}
          <div className="flex items-center gap-2">
            {activeTab === 'leads' && (
              <button
                onClick={exportLeadsCsv}
                disabled={leads.length === 0}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export Leads (CSV)</span>
              </button>
            )}

            {activeTab === 'quotes' && (
              <button
                onClick={exportQuotesCsv}
                disabled={quotes.length === 0}
                className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export Quotes (CSV)</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center p-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-semibold text-gray-700">Connecting to Firebase Backend...</p>
              <p className="text-xs text-gray-400 mt-1">Retrieving leads, quotes & representative analytics</p>
            </div>
          ) : (
            <>
              {/* TAB 1: REPRESENTATIVE ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  {/* KPI Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Quotes Generated</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{quotes.length}</p>
                        <p className="text-xs text-blue-600 font-medium mt-1">Stored in Firebase backend</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Leads Captured</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{leads.length}</p>
                        <p className="text-xs text-emerald-600 font-medium mt-1">All lead details accessible</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Quoted Pipeline</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalPipeline)}</p>
                        <p className="text-xs text-purple-600 font-medium mt-1">Cumulative contract values</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <span className="font-bold text-xl">₹</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Representatives</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{activeRepsCount} <span className="text-xs text-gray-400 font-normal">/ {REPOS_REPRESENTATIVES.length}</span></p>
                        <p className="text-xs text-amber-600 font-medium mt-1">With recorded activity</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Representative Leaderboard Table */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-gray-900">Quotes Generated by Repos Representative</h3>
                        <p className="text-xs text-gray-500">Analysis of quotes and leads generated per representative</p>
                      </div>
                      <div className="w-full sm:w-64">
                        <input
                          type="text"
                          placeholder="Search representative..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-3 px-4">Representative</th>
                            <th className="py-3 px-4">Official Email</th>
                            <th className="py-3 px-4 text-center">Quotes Generated</th>
                            <th className="py-3 px-4 text-center">Leads Captured</th>
                            <th className="py-3 px-4 text-right">Total Quoted Value</th>
                            <th className="py-3 px-4 text-right">Last Active</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {repStats
                            .filter(r => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.email.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((r, idx) => (
                              <tr key={r.email} className={`hover:bg-blue-50/50 transition-colors ${r.quoteCount > 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                <td className="py-3 px-4 font-semibold text-gray-900 flex items-center gap-2">
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    idx === 0 && r.quoteCount > 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                    idx === 1 && r.quoteCount > 0 ? 'bg-slate-200 text-slate-800' :
                                    idx === 2 && r.quoteCount > 0 ? 'bg-amber-50 text-amber-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {idx + 1}
                                  </span>
                                  <span>{r.name}</span>
                                </td>
                                <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">{r.email}</td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                                    r.quoteCount > 0 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    {r.quoteCount}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`px-2 py-0.5 rounded-md font-medium text-xs ${
                                    r.leadCount > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-gray-400'
                                  }`}>
                                    {r.leadCount}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right font-semibold text-gray-900">
                                  {r.totalQuoteValue > 0 ? formatCurrency(r.totalQuoteValue) : '—'}
                                </td>
                                <td className="py-3 px-4 text-right text-gray-500 text-[11px]">
                                  {formatDate(r.lastDate)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BULK LEADS VIEW */}
              {activeTab === 'leads' && (
                <div className="space-y-4">
                  {/* Filters Bar */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                      <div className="relative flex-1 min-w-[200px]">
                        <input
                          type="text"
                          placeholder="Search by customer, company, mobile, state..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

                      <select
                        value={repFilter}
                        onChange={(e) => setRepFilter(e.target.value)}
                        className="px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Representatives</option>
                        {REPOS_REPRESENTATIVES.map(r => (
                          <option key={r.email} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="text-xs font-semibold text-gray-500">
                      Showing {filteredLeads.length} of {leads.length} leads
                    </div>
                  </div>

                  {/* Leads Table */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Customer Name</th>
                            <th className="py-3 px-4">Mobile</th>
                            <th className="py-3 px-4">Company</th>
                            <th className="py-3 px-4">State</th>
                            <th className="py-3 px-4">Consumption</th>
                            <th className="py-3 px-4">Representative</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredLeads.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-gray-500">
                                No lead forms found matching your criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredLeads.map((lead) => (
                              <tr key={lead.id || Math.random()} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{formatDate(lead.createdAt)}</td>
                                <td className="py-3 px-4 font-bold text-gray-900">{lead.name || '—'}</td>
                                <td className="py-3 px-4 text-gray-700 font-mono">{lead.mobile || '—'}</td>
                                <td className="py-3 px-4 text-gray-800 font-medium">{lead.company || '—'}</td>
                                <td className="py-3 px-4 text-gray-600">{lead.state || '—'}</td>
                                <td className="py-3 px-4">
                                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px]">
                                    {lead.consumption || '—'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-semibold text-[11px]">
                                    {lead.salesperson || 'Unassigned'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    onClick={() => setSelectedLead(lead)}
                                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                                  >
                                    View Full
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: BULK QUOTES VIEW */}
              {activeTab === 'quotes' && (
                <div className="space-y-4">
                  {/* Filters Bar */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                      <div className="relative flex-1 min-w-[200px]">
                        <input
                          type="text"
                          placeholder="Search by quote no, customer, company, rep..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

                      <select
                        value={repFilter}
                        onChange={(e) => setRepFilter(e.target.value)}
                        className="px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Representatives</option>
                        {REPOS_REPRESENTATIVES.map(r => (
                          <option key={r.email} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="text-xs font-semibold text-gray-500">
                      Showing {filteredQuotes.length} of {quotes.length} quotes
                    </div>
                  </div>

                  {/* Quotes Table */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                          <tr>
                            <th className="py-3 px-4">Quote No</th>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Company</th>
                            <th className="py-3 px-4">Product</th>
                            <th className="py-3 px-4">Payment</th>
                            <th className="py-3 px-4 text-right">Quote Value</th>
                            <th className="py-3 px-4">Representative</th>
                            <th className="py-3 px-4 text-right">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredQuotes.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="py-12 text-center text-gray-500">
                                No quotes found matching your criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredQuotes.map((q) => (
                              <tr key={q.id || q.quoteNumber} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-4 font-mono font-bold text-blue-600">{q.quoteNumber}</td>
                                <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{formatDate(q.createdAt)}</td>
                                <td className="py-3 px-4 font-bold text-gray-900">{q.customerName || '—'}</td>
                                <td className="py-3 px-4 text-gray-700">{q.company || '—'}</td>
                                <td className="py-3 px-4">
                                  <span className="capitalize bg-slate-100 px-2 py-0.5 rounded font-medium text-[11px]">
                                    {q.selectedProduct}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="uppercase text-[10px] tracking-wide font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {q.paymentMode}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-gray-900">
                                  {formatCurrency(q.totalPrice || q.totalContractValue || 0)}
                                </td>
                                <td className="py-3 px-4">
                                  <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-semibold text-[11px]">
                                    {q.salesperson || 'Unassigned'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    onClick={() => setSelectedQuote(q)}
                                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal footer */}
        <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Connected to Firestore Collection: <span className="font-mono text-gray-700">/leads</span> & <span className="font-mono text-gray-700">/quotes</span>
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition-all"
          >
            Close Data Hub
          </button>
        </div>

      </div>

      {/* Selected Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-[130] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900">Lead Full Profile</h3>
              <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-800">✕</button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b"><span className="text-gray-500 font-medium">Customer Name:</span><span className="font-bold text-gray-900">{selectedLead.name}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-gray-500 font-medium">Mobile:</span><span className="font-mono text-gray-900">{selectedLead.mobile}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-gray-500 font-medium">Email:</span><span className="text-gray-900">{selectedLead.email || '—'}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-gray-500 font-medium">Company:</span><span className="font-semibold text-gray-900">{selectedLead.company}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-gray-500 font-medium">Designation:</span><span className="text-gray-900">{selectedLead.designation || '—'}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-gray-500 font-medium">Industry:</span><span className="text-gray-900">{selectedLead.industry || '—'}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-gray-500 font-medium">State:</span><span className="text-gray-900">{selectedLead.state}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-gray-500 font-medium">Consumption:</span><span className="text-gray-900">{selectedLead.consumption}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-gray-500 font-medium">Fleet Size:</span><span className="text-gray-900">{selectedLead.fleetSize || '—'}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-gray-500 font-medium">Number of Sites:</span><span className="text-gray-900">{selectedLead.numberOfSites || selectedLead.numberOfSite || '—'}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-gray-500 font-medium">GST Number:</span><span className="font-mono text-gray-900">{selectedLead.gstNumber || '—'}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-gray-500 font-medium">Representative:</span><span className="font-bold text-blue-700">{selectedLead.salesperson} ({selectedLead.salespersonEmail || 'N/A'})</span></div>
              <div className="flex justify-between py-1"><span className="text-gray-500 font-medium">Captured At:</span><span className="text-gray-600">{formatDate(selectedLead.createdAt)}</span></div>
            </div>
            <div className="pt-2 text-right">
              <button onClick={() => setSelectedLead(null)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Quote Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-[130] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Quote {selectedQuote.quoteNumber}</h3>
                <p className="text-xs text-gray-500">{formatDate(selectedQuote.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedQuote(null)} className="text-gray-400 hover:text-gray-800">✕</button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b"><span className="text-gray-500 font-medium">Customer:</span><span className="font-bold text-gray-900">{selectedQuote.customerName} ({selectedQuote.customerMobile})</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-gray-500 font-medium">Company:</span><span className="font-semibold text-gray-900">{selectedQuote.company} - {selectedQuote.state}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-gray-500 font-medium">Product / Model:</span><span className="capitalize font-semibold text-gray-900">{selectedQuote.selectedProduct}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-gray-500 font-medium">Configuration:</span><span className="text-gray-800">{selectedQuote.configurationSummary || '—'}</span></div>
              {selectedQuote.finalPartcode && (
                <div className="flex justify-between py-1 border-b"><span className="text-gray-500 font-medium">Part Code:</span><span className="font-mono font-bold text-blue-600">{selectedQuote.finalPartcode}</span></div>
              )}
              <div className="flex justify-between py-1 border-b"><span className="text-gray-500 font-medium">Payment Mode:</span><span className="uppercase font-bold text-emerald-700">{selectedQuote.paymentMode}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-gray-500 font-medium">Subtotal (Excl. GST):</span><span className="font-medium text-gray-900">{formatCurrency(selectedQuote.totalContractValue || 0)}</span></div>
              <div className="flex justify-between py-1 border-b"><span className="text-gray-500 font-medium">GST (18%):</span><span className="font-medium text-gray-900">{formatCurrency(selectedQuote.gstAmount || 0)}</span></div>
              <div className="flex justify-between py-1 border-b bg-blue-50/70 p-2 rounded"><span className="text-blue-900 font-bold">Total Price:</span><span className="font-bold text-sm text-blue-900">{formatCurrency(selectedQuote.totalPrice)}</span></div>
              <div className="flex justify-between py-1"><span className="text-gray-500 font-medium">Generated by Rep:</span><span className="font-bold text-gray-900">{selectedQuote.salesperson} ({selectedQuote.salespersonEmail})</span></div>
            </div>
            <div className="pt-2 text-right">
              <button onClick={() => setSelectedQuote(null)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
