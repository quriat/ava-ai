import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  CreditCard, 
  FileText, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  ShieldCheck, 
  Sparkles, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  Plane, 
  Car, 
  Lock, 
  LogOut, 
  Mail, 
  Phone, 
  X, 
  Receipt, 
  Printer, 
  Check, 
  UserCheck, 
  Briefcase,
  Layers,
  BarChart3,
  ArrowUpDown,
  Star
} from 'lucide-react';
import { 
  CorporateAccount, 
  CorporateEmployee, 
  CorporateRideRecord, 
  CorporateMonthlyInvoice,
  CorporatePolicyTier,
  TripType,
  GoogleReview
} from '../types';
import { DEMO_CORPORATE_ACCOUNTS } from '../data/corporateData';
import { FLEET_DATA, COMPANY_INFO } from '../data/avalimoData';
import LeaveGoogleReviewModal from './LeaveGoogleReviewModal';

interface CorporatePortalProps {
  onBookForEmployee?: (employeeData: Partial<CorporateEmployee>) => void;
  onClose?: () => void;
}

export const CorporatePortal: React.FC<CorporatePortalProps> = ({
  onBookForEmployee,
  onClose
}) => {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<CorporateAccount | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'rides' | 'invoices' | 'employees' | 'book'>('overview');
  
  // Login form state (if logged out)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);

  // New Corporate Application Form State
  const [applyForm, setApplyForm] = useState({
    companyName: '',
    contactName: '',
    workEmail: '',
    phone: '',
    estimatedMonthlyRides: '20-50 rides/mo',
    billingPreference: 'Net-30 Direct Invoicing',
    notes: ''
  });
  const [applySuccess, setApplySuccess] = useState(false);

  // Ride filters
  const [rideSearchQuery, setRideSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All');
  const [expandedRideId, setExpandedRideId] = useState<string | null>(null);
  const [selectedReceiptRide, setSelectedReceiptRide] = useState<CorporateRideRecord | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewPrefillRide, setReviewPrefillRide] = useState<CorporateRideRecord | null>(null);

  // Invoice & Payment state
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<CorporateMonthlyInvoice | null>(null);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);

  // Add employee modal state
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    title: '',
    department: 'Global Energy Trading',
    costCenter: 'CC-TRD-204',
    policyTier: 'Senior Management' as CorporatePolicyTier,
    monthlySpendLimit: 2500,
    phone: ''
  });
  const [addEmployeeSuccess, setAddEmployeeSuccess] = useState(false);

  // Fast booking on behalf state
  const [selectedBookingEmployeeId, setSelectedBookingEmployeeId] = useState<string>(
    selectedAccount.employees[0]?.id || ''
  );
  const [bookingTripType, setBookingTripType] = useState<TripType>(TripType.AIRPORT);
  const [bookingPickup, setBookingPickup] = useState('George Bush Intercontinental (IAH)');
  const [bookingDropoff, setBookingDropoff] = useState('1200 Smith St (Downtown)');
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState('08:00');
  const [bookingFlight, setBookingFlight] = useState('');
  const [bookingCostCenter, setBookingCostCenter] = useState('CC-EXEC-101');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Handle Login — only authorized corporate contacts/employees may sign in.
  // Accepted demo password for all accounts: "avalimo2024" (replace with real SSO later).
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setLoginError('Please enter a valid corporate email address');
      return;
    }
    if (loginPassword !== 'avalimo2024') {
      setLoginError('Incorrect password. Contact your account manager if you need access.');
      return;
    }
    const matched = DEMO_CORPORATE_ACCOUNTS.find(
      (a) => a.primaryContactEmail.toLowerCase() === loginEmail.toLowerCase() ||
             a.employees.some(emp => emp.email.toLowerCase() === loginEmail.toLowerCase())
    );
    if (matched) {
      setSelectedAccount(matched);
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('This email is not registered to a corporate account. Please contact dispatch at (832) 567-8050.');
    }
  };

  // Filtered Rides calculation
  const filteredRides = useMemo(() => {
    return selectedAccount.rides.filter((ride) => {
      // Search query
      if (rideSearchQuery) {
        const q = rideSearchQuery.toLowerCase();
        const matches = 
          ride.passengerName.toLowerCase().includes(q) ||
          ride.confirmationCode.toLowerCase().includes(q) ||
          ride.pickupLocation.toLowerCase().includes(q) ||
          ride.dropoffLocation.toLowerCase().includes(q) ||
          ride.costCenter.toLowerCase().includes(q) ||
          (ride.flightNumber && ride.flightNumber.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Department filter
      if (selectedDeptFilter !== 'All' && ride.department !== selectedDeptFilter) {
        return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'All' && ride.status !== selectedStatusFilter) {
        return false;
      }

      // Date month filter
      if (selectedDateFilter === 'Sep 2026' && !ride.date.startsWith('2026-09')) return false;
      if (selectedDateFilter === 'Aug 2026' && !ride.date.startsWith('2026-08')) return false;

      return true;
    });
  }, [selectedAccount.rides, rideSearchQuery, selectedDeptFilter, selectedStatusFilter, selectedDateFilter]);

  // Export Rides to CSV
  const handleExportCSV = () => {
    const headers = [
      'Confirmation Code',
      'Date',
      'Time',
      'Passenger Name',
      'Department',
      'Cost Center',
      'Trip Type',
      'Pickup Location',
      'Dropoff Location',
      'Vehicle',
      'Chauffeur',
      'Flight #',
      'Status',
      'Base Fare ($)',
      'Gratuity ($)',
      'Total Fare ($)',
      'Invoice Ref'
    ];

    const rows = filteredRides.map(r => [
      `"${r.confirmationCode}"`,
      `"${r.date}"`,
      `"${r.time}"`,
      `"${r.passengerName}"`,
      `"${r.department}"`,
      `"${r.costCenter}"`,
      `"${r.tripType}"`,
      `"${r.pickupLocation.replace(/"/g, '""')}"`,
      `"${r.dropoffLocation.replace(/"/g, '""')}"`,
      `"${r.vehicleName}"`,
      `"${r.chauffeurName}"`,
      `"${r.flightNumber || 'N/A'}"`,
      `"${r.status}"`,
      r.baseFare.toFixed(2),
      r.gratuity.toFixed(2),
      r.totalFare.toFixed(2),
      `"${r.invoiceId}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedAccount.companyName.replace(/\s+/g, '_')}_Rides_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pay Invoice Handler
  const handlePayInvoice = (invoiceId: string) => {
    setPayingInvoiceId(invoiceId);
    setTimeout(() => {
      setSelectedAccount(prev => ({
        ...prev,
        invoices: prev.invoices.map(inv => 
          inv.id === invoiceId ? { ...inv, status: 'Paid', paymentMethodUsed: 'Corporate AMEX (*8802) Settled' } : inv
        )
      }));
      setPayingInvoiceId(null);
      setPaymentSuccessMessage(`Invoice ${invoiceId} marked as paid successfully.`);
      setTimeout(() => setPaymentSuccessMessage(null), 5000);
    }, 900);
  };

  // Add Employee Handler
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.email) return;

    const addedEmp: CorporateEmployee = {
      id: `emp-${Date.now()}`,
      name: newEmployee.name,
      email: newEmployee.email,
      title: newEmployee.title || 'Corporate Associate',
      department: newEmployee.department,
      costCenter: newEmployee.costCenter,
      policyTier: newEmployee.policyTier,
      monthlySpendLimit: Number(newEmployee.monthlySpendLimit) || 2000,
      currentMonthSpend: 0,
      status: 'Active',
      totalRides: 0,
      phone: newEmployee.phone || '(713) 555-0000'
    };

    setSelectedAccount(prev => ({
      ...prev,
      employees: [addedEmp, ...prev.employees]
    }));

    setAddEmployeeSuccess(true);
    setTimeout(() => {
      setAddEmployeeSuccess(false);
      setShowAddEmployeeModal(false);
      setNewEmployee({
        name: '',
        email: '',
        title: '',
        department: 'Global Energy Trading',
        costCenter: 'CC-TRD-204',
        policyTier: 'Senior Management',
        monthlySpendLimit: 2500,
        phone: ''
      });
    }, 1500);
  };

  // Fast Booking Submission Handler
  const handleCorporateBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = selectedAccount.employees.find(e => e.id === selectedBookingEmployeeId);
    if (!emp) return;

    const newRideRecord: CorporateRideRecord = {
      id: `ride-${Date.now()}`,
      confirmationCode: `AVA-CORP-${Math.floor(1000 + Math.random() * 9000)}`,
      date: bookingDate,
      time: bookingTime,
      passengerName: emp.name,
      passengerEmail: emp.email,
      passengerPhone: emp.phone,
      department: emp.department,
      costCenter: bookingCostCenter || emp.costCenter,
      tripType: bookingTripType,
      pickupLocation: bookingPickup,
      dropoffLocation: bookingDropoff,
      vehicleName: 'Cadillac Escalade ESV Platinum',
      vehicleCategory: 'Premium Luxury SUV',
      chauffeurName: 'Antoine Delacroix (Badge #112)',
      chauffeurRating: 5.0,
      flightNumber: bookingFlight || undefined,
      status: 'Scheduled',
      distanceMiles: 25.0,
      durationMinutes: 30,
      baseFare: 145.00,
      gratuity: 29.00,
      tollsAndAirportFees: 0.00,
      totalFare: 174.00,
      invoiceId: 'INV-2026-09-DRAFT',
      notes: 'Direct corporate booking on account (Net-30).'
    };

    setSelectedAccount(prev => ({
      ...prev,
      currentMonthTotalSpend: prev.currentMonthTotalSpend + 174.00,
      rides: [newRideRecord, ...prev.rides],
      employees: prev.employees.map(e => 
        e.id === emp.id ? { ...e, currentMonthSpend: e.currentMonthSpend + 174.00, totalRides: e.totalRides + 1 } : e
      )
    }));

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setActiveTab('rides');
    }, 2000);
  };

  // If Logged Out: Render Corporate Login & Registration View
  if (!isLoggedIn) {
    return (
      <div className="min-h-[85vh] pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-xl mx-auto bg-neutral-900/90 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 mx-auto flex items-center justify-center text-black shadow-lg mb-4">
              <Building2 size={28} />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Corporate Account Portal
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Centralized Net-30 billing, employee ride management, and executive reporting.
            </p>
          </div>

          {/* Quick Demo Switcher */}
          <div className="mb-6 p-3 bg-neutral-950 rounded-xl border border-amber-500/20 text-xs">
            <div className="font-semibold text-amber-400 mb-2 flex items-center">
              <Sparkles size={14} className="mr-1.5" />
              Registered Corporate Accounts:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_CORPORATE_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => setLoginEmail(acc.primaryContactEmail)}
                  className="text-left p-2 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-500/50 transition-colors"
                >
                  <div className="font-bold text-white text-[11px] truncate">{acc.companyName}</div>
                  <div className="text-[10px] text-gray-400 truncate">{acc.tier} • {acc.accountNumber}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Corporate Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-amber-500" size={16} />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. e.rostova@apexenergy.com"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 pl-10 text-sm text-white focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Corporate SSO / Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-amber-500" size={16} />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 pl-10 text-sm text-white focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="text-xs text-red-400 bg-red-950/40 border border-red-500/30 p-2.5 rounded-lg flex items-center space-x-2">
                <AlertCircle size={14} />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-4 rounded-lg uppercase tracking-wider text-xs transition-all shadow-lg shadow-amber-900/40 flex items-center justify-center space-x-2"
            >
              <span>Access Corporate Dashboard</span>
              <ChevronRight size={16} />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-800 text-center">
            <p className="text-xs text-gray-400 mb-3">
              Need a centralized Net-30 executive account for your organization?
            </p>
            <button
              type="button"
              onClick={() => setShowApplyModal(true)}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
            >
              Apply for Corporate Invoicing & Volume Discount Agreement →
            </button>
          </div>
        </div>

        {/* Apply for Corporate Account Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
              <button
                onClick={() => setShowApplyModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <h3 className="font-serif text-xl font-bold text-white mb-2">
                Apply for AvaLimo Corporate Enterprise Account
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Enjoy consolidated Net-30 monthly invoicing, 10–15% fleet discounts, dedicated account dispatch, and duty of care tracking.
              </p>

              {applySuccess ? (
                <div className="p-6 text-center space-y-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                  <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
                  <h4 className="font-bold text-white text-base">Application Received</h4>
                  <p className="text-xs text-gray-300">
                    Our corporate billing director will contact your travel administrator within 2 business hours to verify tax exemption and activate your Net-30 master portal.
                  </p>
                  <button
                    onClick={() => {
                      setApplySuccess(false);
                      setShowApplyModal(false);
                    }}
                    className="mt-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-lg"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setApplySuccess(true); }} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase">Company Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chevron North America / MD Anderson"
                      value={applyForm.companyName}
                      onChange={e => setApplyForm({ ...applyForm, companyName: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase">Contact Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Travel Director / Exec Assistant"
                        value={applyForm.contactName}
                        onChange={e => setApplyForm({ ...applyForm, contactName: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase">Corporate Email</label>
                      <input
                        type="email"
                        required
                        placeholder="billing@company.com"
                        value={applyForm.workEmail}
                        onChange={e => setApplyForm({ ...applyForm, workEmail: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase">Phone</label>
                      <input
                        type="tel"
                        required
                        placeholder="(713) 555-0100"
                        value={applyForm.phone}
                        onChange={e => setApplyForm({ ...applyForm, phone: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase">Billing Preference</label>
                      <select
                        value={applyForm.billingPreference}
                        onChange={e => setApplyForm({ ...applyForm, billingPreference: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-xs text-white"
                      >
                        <option value="Net-30 Direct Invoicing">Net-30 Direct Invoicing</option>
                        <option value="Monthly Corporate AMEX Auto-Debit">Monthly Corporate AMEX Auto-Debit</option>
                        <option value="ACH Direct Wire">ACH Direct Wire</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider mt-2"
                  >
                    Submit Corporate Application
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Logged-in Enterprise Portal Dashboard
  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-in fade-in">
      
      {/* Top Header & Corporate Identity Bar */}
      <div className="bg-neutral-900/90 border border-amber-500/30 rounded-2xl p-5 sm:p-6 mb-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black shadow-lg flex-shrink-0">
            <Building2 size={28} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-white">
                {selectedAccount.companyName}
              </h1>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {selectedAccount.tier}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>Account: <strong className="text-gray-200">{selectedAccount.accountNumber}</strong></span>
              <span>Terms: <strong className="text-gray-200">{selectedAccount.paymentTerms}</strong></span>
              <span>Discount: <strong className="text-emerald-400">{selectedAccount.corporateDiscountRate}% Preferred Rate</strong></span>
            </div>
          </div>
        </div>

        {/* Corporate Controls (client switcher removed — access is per logged-in account) */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setActiveTab('book')}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md"
          >
            <Plus size={14} />
            <span>Book for Executive</span>
          </button>

          <button
            onClick={() => { setIsLoggedIn(false); setSelectedAccount(null); }}
            title="Sign out of corporate portal"
            className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {paymentSuccessMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{paymentSuccessMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-800 mb-6 space-x-2 sm:space-x-4 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
          { id: 'rides', label: `Trip Logs & Rides (${selectedAccount.rides.length})`, icon: Clock },
          { id: 'invoices', label: `Monthly Invoices (${selectedAccount.invoices.length})`, icon: FileText },
          { id: 'employees', label: `Employees & Policy (${selectedAccount.employees.length})`, icon: Users },
          { id: 'book', label: 'Schedule Corporate Ride', icon: Car }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-all whitespace-nowrap border-b-2 ${
                isActive
                  ? 'text-amber-400 border-amber-500 bg-neutral-900/60'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-neutral-900/30'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded-xl">
              <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
                <span>Month-to-Date Spend</span>
                <DollarSign size={16} className="text-amber-500" />
              </div>
              <div className="text-2xl font-serif font-bold text-white">
                ${selectedAccount.currentMonthTotalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Cap: ${selectedAccount.monthlySpendLimit.toLocaleString()} ({Math.round((selectedAccount.currentMonthTotalSpend / selectedAccount.monthlySpendLimit) * 100)}% utilized)
              </div>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded-xl">
              <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
                <span>Total Corporate Rides</span>
                <Car size={16} className="text-amber-500" />
              </div>
              <div className="text-2xl font-serif font-bold text-white">
                {selectedAccount.rides.length} Rides
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
                <ShieldCheck size={12} />
                <span>100% On-Time Chauffeur SLA</span>
              </div>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded-xl">
              <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
                <span>Active Net-30 Invoices</span>
                <FileText size={16} className="text-amber-500" />
              </div>
              <div className="text-2xl font-serif font-bold text-white">
                {selectedAccount.invoices.filter(i => i.status === 'Due').length} Due
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Next statement due: <strong className="text-amber-400">{selectedAccount.invoices[0]?.dueDate || 'Oct 1, 2026'}</strong>
              </div>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded-xl">
              <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
                <span>Authorized Executives</span>
                <Users size={16} className="text-amber-500" />
              </div>
              <div className="text-2xl font-serif font-bold text-white">
                {selectedAccount.employees.length} Members
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                {selectedAccount.departmentBudgets.length} Corporate Cost Centers
              </div>
            </div>
          </div>

          {/* Departmental Spend vs Budget Allocation */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Departmental Budget Tracking</h3>
                <p className="text-xs text-gray-400">Real-time spend caps and cost center tracking.</p>
              </div>
              <span className="text-xs text-amber-400 font-semibold font-mono">
                Corporate Rate: {selectedAccount.corporateDiscountRate}% Off Fleet
              </span>
            </div>

            <div className="space-y-4">
              {selectedAccount.departmentBudgets.map((dept) => {
                const percent = Math.min(100, Math.round((dept.currentSpend / dept.monthlyBudget) * 100));
                return (
                  <div key={dept.department} className="bg-neutral-950 p-3.5 rounded-lg border border-neutral-800/80">
                    <div className="flex flex-wrap justify-between items-center text-xs mb-2">
                      <div>
                        <span className="font-bold text-white">{dept.department}</span>
                        <span className="text-gray-400 text-[11px] ml-2">({dept.employeeCount} travelers • Mgr: {dept.manager})</span>
                      </div>
                      <div className="font-mono">
                        <span className="text-amber-400 font-bold">${dept.currentSpend.toLocaleString()}</span>
                        <span className="text-gray-500"> / ${dept.monthlyBudget.toLocaleString()} ({percent}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${
                          percent > 85 ? 'bg-red-500' : percent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Trips Quick Table */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-white">Recent Corporate Transfers</h3>
              <button
                onClick={() => setActiveTab('rides')}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center"
              >
                View Full Logs <ChevronRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-gray-400 uppercase text-[10px]">
                    <th className="pb-2">Confirmation</th>
                    <th className="pb-2">Passenger</th>
                    <th className="pb-2">Date & Time</th>
                    <th className="pb-2">Route</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Fare</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {selectedAccount.rides.slice(0, 4).map((ride) => (
                    <tr key={ride.id} className="hover:bg-neutral-800/30">
                      <td className="py-3 font-mono text-amber-400 font-bold">{ride.confirmationCode}</td>
                      <td className="py-3">
                        <div className="font-semibold text-white">{ride.passengerName}</div>
                        <div className="text-[10px] text-gray-400">{ride.department}</div>
                      </td>
                      <td className="py-3 text-gray-300">{ride.date} • {ride.time}</td>
                      <td className="py-3 text-gray-300 max-w-[200px] truncate">
                        {ride.pickupLocation} → {ride.dropoffLocation}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ride.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                          ride.status === 'En Route' ? 'bg-blue-950 text-blue-400 border border-blue-500/30 animate-pulse' :
                          'bg-amber-950 text-amber-400 border border-amber-500/30'
                        }`}>
                          {ride.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-white">${ride.totalFare.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRIP LOGS & HISTORICAL RIDES */}
      {activeTab === 'rides' && (
        <div className="space-y-4">
          {/* Filter & Export Toolbar */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
                <input
                  type="text"
                  placeholder="Search passenger, code, flight, location, or cost center..."
                  value={rideSearchQuery}
                  onChange={(e) => setRideSearchQuery(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Department filter */}
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-700 rounded-lg py-2 px-3 text-xs text-white focus:border-amber-500"
              >
                <option value="All">All Departments</option>
                {selectedAccount.departmentBudgets.map(d => (
                  <option key={d.department} value={d.department}>{d.department}</option>
                ))}
              </select>

              {/* Status filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-700 rounded-lg py-2 px-3 text-xs text-white focus:border-amber-500"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="En Route">En Route</option>
                <option value="Scheduled">Scheduled</option>
              </select>

              {/* Month filter */}
              <select
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-700 rounded-lg py-2 px-3 text-xs text-white focus:border-amber-500"
              >
                <option value="All">All Dates</option>
                <option value="Sep 2026">September 2026</option>
                <option value="Aug 2026">August 2026</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              {/* Google Review Trigger */}
              <button
                onClick={() => {
                  setReviewPrefillRide(filteredRides[0] || null);
                  setIsReviewModalOpen(true);
                }}
                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors"
                title="Leave a Google Review for your executive rides"
              >
                <Star size={13} className="fill-amber-400" />
                <span>Rate on Google</span>
              </button>

              {/* CSV Export Button */}
              <button
                onClick={handleExportCSV}
                className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <Download size={14} className="text-amber-400" />
                <span>Export CSV ({filteredRides.length})</span>
              </button>
            </div>
          </div>

          {/* Rides Master Table */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-950 border-b border-neutral-800 text-gray-400 uppercase text-[10px]">
                    <th className="p-3.5">Ride Code</th>
                    <th className="p-3.5">Passenger & Dept</th>
                    <th className="p-3.5">Schedule</th>
                    <th className="p-3.5">Route & Flight</th>
                    <th className="p-3.5">Vehicle & Chauffeur</th>
                    <th className="p-3.5">Cost Center</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Fare</th>
                    <th className="p-3.5 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredRides.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-gray-500 text-xs">
                        No historical corporate rides match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRides.map((ride) => (
                      <React.Fragment key={ride.id}>
                        <tr 
                          onClick={() => setExpandedRideId(expandedRideId === ride.id ? null : ride.id)}
                          className="hover:bg-neutral-800/40 cursor-pointer transition-colors"
                        >
                          <td className="p-3.5 font-mono text-amber-400 font-bold">
                            <div className="flex items-center space-x-1">
                              <span>{ride.confirmationCode}</span>
                              <ChevronDown size={12} className={`text-gray-500 transition-transform ${expandedRideId === ride.id ? 'rotate-180' : ''}`} />
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-white">{ride.passengerName}</div>
                            <div className="text-[10px] text-gray-400">{ride.department}</div>
                          </td>
                          <td className="p-3.5 text-gray-300 whitespace-nowrap">
                            <div>{ride.date}</div>
                            <div className="text-[10px] text-gray-400">{ride.time}</div>
                          </td>
                          <td className="p-3.5 max-w-[220px]">
                            <div className="truncate text-white font-medium">{ride.pickupLocation}</div>
                            <div className="truncate text-gray-400 text-[10px]">→ {ride.dropoffLocation}</div>
                            {ride.flightNumber && (
                              <span className="inline-flex items-center text-[10px] text-amber-400 font-mono mt-0.5">
                                <Plane size={10} className="mr-1" /> {ride.flightNumber}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <div className="text-gray-200 font-medium">{ride.vehicleName}</div>
                            <div className="text-[10px] text-gray-400">{ride.chauffeurName}</div>
                          </td>
                          <td className="p-3.5 font-mono text-gray-300 text-[11px]">
                            {ride.costCenter}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ride.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                              ride.status === 'En Route' ? 'bg-blue-950 text-blue-400 border border-blue-500/30 animate-pulse' :
                              'bg-amber-950 text-amber-400 border border-amber-500/30'
                            }`}>
                              {ride.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-white whitespace-nowrap">
                            ${ride.totalFare.toFixed(2)}
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReceiptRide(ride);
                              }}
                              className="p-1.5 rounded hover:bg-neutral-700 text-gray-400 hover:text-amber-400 transition-colors"
                              title="View & Print Itemized PDF Receipt"
                            >
                              <Receipt size={15} />
                            </button>
                          </td>
                        </tr>

                        {/* Expanded details row */}
                        {expandedRideId === ride.id && (
                          <tr className="bg-neutral-950/90 border-b border-neutral-800">
                            <td colSpan={9} className="p-4 text-xs">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-900 p-3.5 rounded-lg border border-neutral-800">
                                <div>
                                  <div className="text-[10px] uppercase text-gray-400 font-semibold mb-1">Route & Telemetry</div>
                                  <p className="text-gray-300"><strong className="text-white">Distance:</strong> {ride.distanceMiles} Miles</p>
                                  <p className="text-gray-300"><strong className="text-white">Trip Type:</strong> {ride.tripType}</p>
                                  {ride.notes && <p className="text-amber-300 text-[11px] mt-1"><strong className="text-white">Dispatch Log:</strong> {ride.notes}</p>}
                                </div>
                                <div>
                                  <div className="text-[10px] uppercase text-gray-400 font-semibold mb-1">Passenger Contact & Review</div>
                                  <p className="text-gray-300"><strong className="text-white">Email:</strong> {ride.passengerEmail}</p>
                                  <p className="text-gray-300"><strong className="text-white">Phone:</strong> {ride.passengerPhone}</p>
                                  <p className="text-gray-300"><strong className="text-white">Invoice Ref:</strong> {ride.invoiceId}</p>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setReviewPrefillRide(ride);
                                      setIsReviewModalOpen(true);
                                    }}
                                    className="mt-2 inline-flex items-center space-x-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded text-[10px] font-bold transition-colors"
                                  >
                                    <Star size={11} className="fill-amber-400" />
                                    <span>Rate Ride on Google Reviews</span>
                                  </button>
                                </div>
                                <div>
                                  <div className="text-[10px] uppercase text-gray-400 font-semibold mb-1">Fare Breakdown (Net-30)</div>
                                  <div className="space-y-0.5 text-[11px]">
                                    <div className="flex justify-between text-gray-300">
                                      <span>Base Vehicle Charter:</span>
                                      <span>${ride.baseFare.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-300">
                                      <span>Standard Chauffeur Gratuity (20%):</span>
                                      <span>${ride.gratuity.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-emerald-400">
                                      <span>EZ-Tag Express Tollways:</span>
                                      <span>$0.00 (Included)</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-white border-t border-neutral-700 pt-1">
                                      <span>Total Corporate Billed:</span>
                                      <span className="text-amber-400 font-mono">${ride.totalFare.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MONTHLY INVOICES & BILLING MANAGEMENT */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          {/* Monthly Invoices List */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Monthly Consolidated Statements</h3>
                <p className="text-xs text-gray-400">
                  Itemized Net-30 statements categorized by cost center and department.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Default Method:</span>
                <span className="text-xs font-bold text-amber-400 bg-neutral-950 px-2.5 py-1 rounded border border-neutral-800">
                  {selectedAccount.defaultPaymentMethod}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {selectedAccount.invoices.map((inv) => (
                <div 
                  key={inv.id}
                  className="bg-neutral-950 border border-neutral-800 hover:border-amber-500/30 p-4 rounded-xl transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">{inv.invoiceNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inv.status === 'Paid' 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                      }`}>
                        {inv.status}
                      </span>
                      <span className="text-xs font-bold text-white">{inv.billingMonth}</span>
                    </div>

                    <div className="text-xs text-gray-400 flex flex-wrap gap-x-4">
                      <span>Period: <strong className="text-gray-200">{inv.billingPeriod}</strong></span>
                      <span>Total Rides: <strong className="text-gray-200">{inv.totalRides}</strong></span>
                      <span>Due: <strong className="text-gray-200">{inv.dueDate}</strong></span>
                    </div>
                  </div>

                  {/* Department mini badges */}
                  <div className="hidden xl:flex items-center space-x-2">
                    {inv.breakdownByDepartment.slice(0, 2).map(d => (
                      <span key={d.department} className="text-[10px] bg-neutral-900 border border-neutral-800 px-2 py-1 rounded text-gray-300">
                        {d.department.split('&')[0]}: <strong className="text-white">${d.amount.toFixed(0)}</strong>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-800">
                    <div className="text-right">
                      <div className="text-[10px] uppercase text-gray-400">Total Billed</div>
                      <div className="font-serif font-bold text-base sm:text-lg text-white font-mono">
                        ${inv.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceForModal(inv)}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                      >
                        <FileText size={13} className="text-amber-400" />
                        <span>View PDF</span>
                      </button>

                      {inv.status === 'Due' && (
                        <button
                          type="button"
                          onClick={() => handlePayInvoice(inv.id)}
                          disabled={payingInvoiceId === inv.id}
                          className="bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center space-x-1"
                        >
                          {payingInvoiceId === inv.id ? (
                            <span>Settling...</span>
                          ) : (
                            <>
                              <CreditCard size={13} />
                              <span>Settle Now</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EMPLOYEES & ROSTER POLICY MANAGEMENT */}
      {activeTab === 'employees' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Authorized Employee Travelers</h3>
                <p className="text-xs text-gray-400">
                  Manage individual spending caps, policy tiers, and executive cost centers.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddEmployeeModal(true)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3.5 py-2 rounded-lg text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md"
              >
                <Plus size={14} />
                <span>Add Employee Traveler</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-950 border-b border-neutral-800 text-gray-400 uppercase text-[10px]">
                    <th className="p-3">Employee Name</th>
                    <th className="p-3">Department & Cost Center</th>
                    <th className="p-3">Policy Tier</th>
                    <th className="p-3">Month Spend / Cap</th>
                    <th className="p-3">Lifetime Rides</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {selectedAccount.employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-neutral-800/30">
                      <td className="p-3">
                        <div className="font-semibold text-white">{emp.name}</div>
                        <div className="text-[11px] text-gray-400">{emp.email} • {emp.phone}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-gray-200">{emp.department}</div>
                        <div className="font-mono text-[10px] text-amber-400">{emp.costCenter}</div>
                      </td>
                      <td className="p-3">
                        <span className="bg-neutral-950 border border-neutral-700 px-2 py-0.5 rounded text-[10px] font-bold text-gray-300">
                          {emp.policyTier}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-mono font-bold text-white">
                          ${emp.currentMonthSpend} <span className="text-gray-500 text-[10px]">/ ${emp.monthlySpendLimit}</span>
                        </div>
                        <div className="w-24 bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-1">
                          <div 
                            className="bg-amber-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, (emp.currentMonthSpend / emp.monthlySpendLimit) * 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="p-3 text-gray-300 font-mono">
                        {emp.totalRides} rides
                      </td>
                      <td className="p-3">
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                          {emp.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBookingEmployeeId(emp.id);
                            setActiveTab('book');
                          }}
                          className="text-amber-400 hover:text-amber-300 font-bold text-[11px] hover:underline"
                        >
                          Book Transfer →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SCHEDULE CORPORATE RIDE */}
      {activeTab === 'book' && (
        <div className="bg-neutral-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-2xl max-w-3xl mx-auto">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-neutral-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Car size={20} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-white">Book Executive Transfer on Account</h3>
              <p className="text-xs text-gray-400">
                Direct booking billed to corporate Net-30 master agreement. Zero credit card needed.
              </p>
            </div>
          </div>

          {bookingSuccess ? (
            <div className="p-8 text-center space-y-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl animate-in fade-in">
              <CheckCircle2 size={40} className="text-emerald-400 mx-auto" />
              <h4 className="font-serif text-xl font-bold text-white">Corporate Transfer Scheduled</h4>
              <p className="text-xs text-gray-300 max-w-md mx-auto">
                Reservation dispatched to premium executive fleet. Confirmation sent to passenger and corporate travel desk.
              </p>
              <div className="pt-2">
                <span className="text-xs text-amber-400 font-mono">Redirecting to Live Trip Logs...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCorporateBookSubmit} className="space-y-4 text-left">
              {/* Select Employee */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Select Authorized Passenger / Executive
                </label>
                <select
                  value={selectedBookingEmployeeId}
                  onChange={(e) => {
                    setSelectedBookingEmployeeId(e.target.value);
                    const emp = selectedAccount.employees.find(emp => emp.id === e.target.value);
                    if (emp) setBookingCostCenter(emp.costCenter);
                  }}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-xs text-white focus:border-amber-500"
                >
                  {selectedAccount.employees.map(emp => (
                    <option key={emp.id} value={emp.id} className="bg-neutral-900 text-white">
                      {emp.name} — {emp.title} ({emp.department} • {emp.costCenter})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Trip Type
                  </label>
                  <select
                    value={bookingTripType}
                    onChange={(e) => setBookingTripType(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-xs text-white focus:border-amber-500"
                  >
                    <option value={TripType.AIRPORT}>Airport Transfer (IAH / HOU / FBO)</option>
                    <option value={TripType.POINT_TO_POINT}>Point to Point / City Transfer</option>
                    <option value={TripType.HOURLY}>Hourly Executive Charter</option>
                    <option value={TripType.GALVESTON}>Galveston Cruise / Port</option>
                    <option value={TripType.INTERCITY}>Intercity (Austin / Dallas)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Cost Center Reference
                  </label>
                  <input
                    type="text"
                    value={bookingCostCenter}
                    onChange={(e) => setBookingCostCenter(e.target.value)}
                    placeholder="e.g. CC-EXEC-101"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-xs text-white focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Pickup & Dropoff */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    value={bookingPickup}
                    onChange={(e) => setBookingPickup(e.target.value)}
                    required
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-xs text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Dropoff Destination
                  </label>
                  <input
                    type="text"
                    value={bookingDropoff}
                    onChange={(e) => setBookingDropoff(e.target.value)}
                    required
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-xs text-white focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Date, Time & Flight */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-xs text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Time
                  </label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    required
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-xs text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Flight # (Optional)
                  </label>
                  <input
                    type="text"
                    value={bookingFlight}
                    onChange={(e) => setBookingFlight(e.target.value.toUpperCase())}
                    placeholder="e.g. UA 1428"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-xs text-white focus:border-amber-500 font-mono uppercase"
                  />
                </div>
              </div>

              {/* Corporate Invoicing Guarantee Box */}
              <div className="p-3 bg-neutral-950 rounded-xl border border-amber-500/20 text-xs text-gray-300 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck size={18} className="text-amber-400 flex-shrink-0" />
                  <span>Billed automatically to <strong>{selectedAccount.companyName}</strong> (Net-30 Invoice).</span>
                </div>
                <span className="text-emerald-400 font-bold font-mono">15% Discount Applied</span>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-4 rounded-lg uppercase tracking-wider text-xs transition-all shadow-lg shadow-amber-900/40"
              >
                Confirm Corporate Reservation
              </button>
            </form>
          )}
        </div>
      )}

      {/* MODAL: ITEMIZE PDF RECEIPT VIEWER */}
      {selectedReceiptRide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-2xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative text-left">
            <button
              onClick={() => setSelectedReceiptRide(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            {/* Receipt Content */}
            <div className="border-b border-neutral-800 pb-4 mb-4 flex justify-between items-start">
              <div>
                <div className="font-serif text-2xl font-bold text-white">AVALIMO<span className="text-amber-500">.</span></div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest">Executive Chauffeur Houston</div>
                <div className="text-[11px] text-gray-400 mt-1">Direct: (713) 902-8888 • billing@avalimo.net</div>
              </div>

              <div className="text-right">
                <span className="bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
                  PAID ON ACCOUNT
                </span>
                <div className="font-mono text-xs text-amber-400 font-bold mt-1">
                  {selectedReceiptRide.confirmationCode}
                </div>
                <div className="text-[10px] text-gray-400">{selectedReceiptRide.date}</div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase">Passenger:</span>
                  <div className="font-bold text-white">{selectedReceiptRide.passengerName}</div>
                  <div className="text-gray-400 text-[11px]">{selectedReceiptRide.department}</div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase">Billed Account:</span>
                  <div className="font-bold text-white">{selectedAccount.companyName}</div>
                  <div className="text-gray-400 text-[11px]">Cost Center: {selectedReceiptRide.costCenter}</div>
                </div>
              </div>

              <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-400">Pickup:</span>
                  <span className="text-white text-right max-w-[280px]">{selectedReceiptRide.pickupLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Dropoff:</span>
                  <span className="text-white text-right max-w-[280px]">{selectedReceiptRide.dropoffLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vehicle & Chauffeur:</span>
                  <span className="text-white">{selectedReceiptRide.vehicleName} ({selectedReceiptRide.chauffeurName})</span>
                </div>
              </div>

              {/* Line items */}
              <div className="pt-2 border-t border-neutral-800 space-y-1">
                <div className="flex justify-between text-gray-300">
                  <span>Executive Charter Base Rate:</span>
                  <span className="font-mono">${selectedReceiptRide.baseFare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Chauffeur Gratuity (20%):</span>
                  <span className="font-mono">${selectedReceiptRide.gratuity.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Airport Fees & Tolls:</span>
                  <span className="font-mono">$0.00 (Included)</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-neutral-700">
                  <span>Total Master Account Charge:</span>
                  <span className="text-amber-400 font-mono">${selectedReceiptRide.totalFare.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-between items-center">
              <span className="text-[11px] text-gray-500 font-mono">Invoice Reference: {selectedReceiptRide.invoiceId}</span>
              <button
                onClick={() => window.print()}
                className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5"
              >
                <Printer size={13} className="text-amber-400" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MONTHLY INVOICE STATEMENT VIEWER */}
      {selectedInvoiceForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative text-left">
            <button
              onClick={() => setSelectedInvoiceForModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="border-b border-neutral-800 pb-4 mb-4 flex justify-between items-start">
              <div>
                <div className="font-serif text-2xl font-bold text-white">AVALIMO<span className="text-amber-500">.</span></div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest">Master Executive Invoice</div>
                <div className="text-xs text-gray-400 mt-1">AvaLimo Luxury Chauffeur Group LLC</div>
                <div className="text-xs text-gray-400">Houston, Texas • Tax ID: XX-XXX8921</div>
              </div>

              <div className="text-right">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase ${
                  selectedInvoiceForModal.status === 'Paid' ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30' : 'bg-amber-950 text-amber-400 border-amber-500/30'
                }`}>
                  {selectedInvoiceForModal.status}
                </span>
                <div className="font-mono text-sm text-amber-400 font-bold mt-1">
                  {selectedInvoiceForModal.invoiceNumber}
                </div>
                <div className="text-xs text-gray-400">Due: {selectedInvoiceForModal.dueDate}</div>
              </div>
            </div>

            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-xs mb-4">
              <div className="font-bold text-white mb-1">Billed To:</div>
              <div className="text-gray-200">{selectedAccount.companyName}</div>
              <div className="text-gray-400">{selectedAccount.billingAddress}</div>
              <div className="text-gray-400">Attn: {selectedAccount.primaryContactName} ({selectedAccount.primaryContactEmail})</div>
            </div>

            {/* Department breakdown table */}
            <div className="mb-4">
              <h4 className="text-xs uppercase font-bold text-amber-400 mb-2">
                Spend Breakdown by Department & Cost Center
              </h4>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-neutral-800 text-gray-400 uppercase text-[10px]">
                    <th className="pb-1.5">Department</th>
                    <th className="pb-1.5 text-center">Total Rides</th>
                    <th className="pb-1.5 text-right">Amount Billed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {selectedInvoiceForModal.breakdownByDepartment.map(d => (
                    <tr key={d.department}>
                      <td className="py-2 text-white font-medium">{d.department}</td>
                      <td className="py-2 text-center text-gray-400">{d.rideCount}</td>
                      <td className="py-2 text-right font-mono text-white">${d.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t border-neutral-800 pt-3 space-y-1 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal ({selectedInvoiceForModal.totalRides} Executive Rides):</span>
                <span className="font-mono">${selectedInvoiceForModal.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Chauffeur Gratuities (20%):</span>
                <span className="font-mono">${selectedInvoiceForModal.gratuityTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Corporate Toll Waiver Savings:</span>
                <span className="font-mono">-${Math.abs(selectedInvoiceForModal.tollsComplimentaryDiscount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-serif font-bold text-base text-white pt-2 border-t border-neutral-700">
                <span>Total Net-30 Invoice Amount:</span>
                <span className="text-amber-400 font-mono">${selectedInvoiceForModal.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-between items-center">
              <span className="text-[11px] text-gray-400">{selectedInvoiceForModal.paymentMethodUsed || selectedAccount.defaultPaymentMethod}</span>
              <button
                onClick={() => window.print()}
                className="bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5"
              >
                <Printer size={13} />
                <span>Print Statement (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD EMPLOYEE TRAVELER */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl text-left">
            <button
              onClick={() => setShowAddEmployeeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="font-serif text-xl font-bold text-white mb-1">
              Add Authorized Employee Traveler
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Add an executive or employee to book on the {selectedAccount.companyName} master account.
            </p>

            {addEmployeeSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                <CheckCircle2 size={32} className="text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">Employee Traveler Added</h4>
                <p className="text-xs text-gray-300">
                  Authorized profile synced to AvaLimo dispatch.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddEmployee} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rachel Henderson"
                    value={newEmployee.name}
                    onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Corporate Email</label>
                    <input
                      type="email"
                      required
                      placeholder="rachel@company.com"
                      value={newEmployee.email}
                      onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Direct Mobile Phone</label>
                    <input
                      type="tel"
                      placeholder="(713) 555-0100"
                      value={newEmployee.phone}
                      onChange={e => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Department</label>
                    <select
                      value={newEmployee.department}
                      onChange={e => setNewEmployee({ ...newEmployee, department: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-white"
                    >
                      {selectedAccount.departmentBudgets.map(d => (
                        <option key={d.department} value={d.department}>{d.department}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Cost Center Code</label>
                    <input
                      type="text"
                      placeholder="CC-TRD-204"
                      value={newEmployee.costCenter}
                      onChange={e => setNewEmployee({ ...newEmployee, costCenter: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Policy Tier</label>
                    <select
                      value={newEmployee.policyTier}
                      onChange={e => setNewEmployee({ ...newEmployee, policyTier: e.target.value as any })}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-white"
                    >
                      <option value="Executive VIP">Executive VIP (All Fleet)</option>
                      <option value="Senior Management">Senior Management (Sedan/SUV)</option>
                      <option value="Standard Business">Standard Business (Executive Sedan)</option>
                      <option value="Guest & Client">Guest & Client</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Monthly Spend Cap ($)</label>
                    <input
                      type="number"
                      value={newEmployee.monthlySpendLimit}
                      onChange={e => setNewEmployee({ ...newEmployee, monthlySpendLimit: Number(e.target.value) })}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-lg uppercase tracking-wider text-xs mt-2 shadow-md"
                >
                  Save & Authorize Traveler
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Google Review Modal for Corporate Trips */}
      <LeaveGoogleReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setReviewPrefillRide(null);
        }}
        prefillData={reviewPrefillRide ? {
          confirmationCode: reviewPrefillRide.id,
          passengerName: reviewPrefillRide.passengerName,
          passengerEmail: reviewPrefillRide.passengerEmail,
          vehicleName: reviewPrefillRide.vehicleName,
          chauffeurName: reviewPrefillRide.chauffeurName,
          tripType: reviewPrefillRide.tripType,
          route: `${reviewPrefillRide.pickupLocation} → ${reviewPrefillRide.dropoffLocation}`
        } : undefined}
      />
    </div>
  );
};

export default CorporatePortal;
