import React, { useState, useEffect } from 'react';
import { Truck, Settings, FileText, Calculator, HelpCircle, Menu, X } from 'lucide-react';
import { RouteBuilder } from './components/RouteBuilder';
import { PriceCalculator } from './components/PriceCalculator';
import { QuoteManager } from './components/QuoteManager';
import { AdminPanel } from './components/AdminPanel';
import { UserGuide } from './components/UserGuide';
import { RouteBuilderState, Quote, PriceBreakdown } from './types';
import { PricingService } from './services/pricingService';
import { StorageService } from './services/storageService';


function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'quotes'>('calculator');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [pricingService] = useState(() => new PricingService());
  const [storageService] = useState(() => new StorageService());
  

  const [routeState, setRouteState] = useState<RouteBuilderState>({
    stops: [
      { id: 'stop_1', type: 'pickup', lga: '', address: '' },
      { id: 'stop_2', type: 'dropoff', lga: '', address: '' },
    ],
    loadSize: 'semi-full',
    pickupTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    isCalculating: false,
  });

  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  // Calculate price when route changes
  useEffect(() => {
    const validStops = routeState.stops.filter(stop => stop.lga.trim() !== '');
    
    if (validStops.length >= 2) {
      setRouteState((prev: RouteBuilderState) => ({ ...prev, isCalculating: true }));
      
      // Simulate async calculation
      setTimeout(() => {
        const distance = pricingService.calculateTotalDistance(validStops);
        const breakdown = pricingService.calculatePrice(
          distance,
          routeState.loadSize,
          routeState.pickupTime
        );
        
        setPriceBreakdown(breakdown);
        setRouteState(prev => ({ ...prev, isCalculating: false }));
      }, 500);
    } else {
      setPriceBreakdown(null);
    }
  }, [routeState.stops, routeState.loadSize, routeState.pickupTime, pricingService]);

  const handleSaveQuote = () => {
    if (!priceBreakdown) return;

    const quote: Quote = {
      id: editingQuote?.id || `quote_${Date.now()}`,
      stops: routeState.stops.filter(stop => stop.lga.trim() !== ''),
      loadSize: routeState.loadSize,
      pickupTime: routeState.pickupTime,
      distance: priceBreakdown.baseDistance,
      price: priceBreakdown.total,
      breakdown: priceBreakdown,
      createdAt: editingQuote?.createdAt || new Date().toISOString(),
      status: 'draft',
    };

    storageService.saveQuote(quote);
    setEditingQuote(null);
    alert('Quote saved successfully!');
  };

  const handleEditQuote = (quote: Quote) => {
    setRouteState({
      stops: quote.stops,
      loadSize: quote.loadSize,
      pickupTime: quote.pickupTime,
      isCalculating: false,
    });
    setEditingQuote(quote);
    setActiveTab('calculator');
  };

  const handleNewQuote = () => {
    setRouteState({
      stops: [
        { id: 'stop_1', type: 'pickup', lga: '', address: '' },
        { id: 'stop_2', type: 'dropoff', lga: '', address: '' },
      ],
      loadSize: 'semi-full',
      pickupTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      isCalculating: false,
    });
    setEditingQuote(null);
    setPriceBreakdown(null);
    setActiveTab('calculator');
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Responsive Header */}
<header className="bg-white shadow-sm border-b sticky top-0 z-10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Logo/Branding (always visible) */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
          <Truck className="w-6 h-6 text-white" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold text-gray-900">Nigeram Logistics</h1>
          <p className="text-sm text-gray-600">Pricing Calculator</p>
        </div>
      </div>

      {/* Desktop Navigation (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-4">
        <nav className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'calculator'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Calculator</span>
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'quotes'
                ? 'bg-emerald-100 text-emerald-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Quotes</span>
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUserGuide(true)}
            className="p-2 text-gray-600 hover:text-green-600 transition-colors"
            title="User Guide & Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowAdminPanel(true)}
            className="p-2 text-gray-600 hover:text-green-600 transition-colors"
            title="Admin Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Button (visible only on mobile) */}
      <div className="md:hidden flex items-center">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:text-green-600 focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  </div>

  {/* Mobile Menu (dropdown) */}
  {isMobileMenuOpen && (
    <div className="md:hidden bg-white border-t">
      <div className="px-2 pt-2 pb-3 space-y-1">
        <button
          onClick={() => {
            setActiveTab('calculator');
            setIsMobileMenuOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${
            activeTab === 'calculator'
              ? 'bg-green-100 text-green-700'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Calculator className="w-5 h-5" />
          Calculator
        </button>
        <button
          onClick={() => {
            setActiveTab('quotes');
            setIsMobileMenuOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${
            activeTab === 'quotes'
              ? 'bg-emerald-100 text-emerald-700'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <FileText className="w-5 h-5" />
          Quotes
        </button>
        <div className="border-t pt-2 mt-1">
          <button
            onClick={() => {
              setShowUserGuide(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            <HelpCircle className="w-5 h-5" />
            Help & Guide
          </button>
          <button
            onClick={() => {
              setShowAdminPanel(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            <Settings className="w-5 h-5" />
            Admin Settings
          </button>
        </div>
      </div>
    </div>
  )}
</header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'calculator' ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-6">
              <RouteBuilder state={routeState} onStateChange={setRouteState} />
              
              {priceBreakdown && (
                <div className="flex gap-4">
                  <button
                    onClick={handleSaveQuote}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    {editingQuote ? 'Update Quote' : 'Save Quote'}
                  </button>
                  {editingQuote && (
                    <button
                      onClick={() => {
                        setEditingQuote(null);
                        handleNewQuote();
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <PriceCalculator
                breakdown={priceBreakdown}
                isCalculating={routeState.isCalculating}
                distance={priceBreakdown?.baseDistance || 0}
              />
            </div>
          </div>
        ) : (
          <QuoteManager onCreateNew={handleNewQuote} onEditQuote={handleEditQuote} />
        )}
      </main>

      {/* Modals */}
      <AdminPanel isOpen={showAdminPanel} onClose={() => setShowAdminPanel(false)} />
      <UserGuide isOpen={showUserGuide} onClose={() => setShowUserGuide(false)} />
    </div>
  );
}

export default App;