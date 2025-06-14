import React, { useState, useEffect } from 'react';
import { Truck, Settings, FileText, Calculator, HelpCircle, Menu, X } from 'lucide-react';
import { EnhancedRouteBuilder } from './components/EnhancedRouteBuilder';
import { EnhancedPriceCalculator } from './components/EnhancedPriceCalculator';
import { GoogleMapsDisplay } from './components/GoogleMapsDisplay';
import { QuoteManager } from './components/QuoteManager';
import { AdminPanel } from './components/AdminPanel';
import { UserGuide } from './components/UserGuide';
import { RouteBuilderState, Quote, PriceBreakdown, FuelData } from './types';
import { EnhancedPricingService } from './services/enhancedPricingService';
import { StorageService } from './services/storageService';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'quotes'>('calculator');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [pricingService] = useState(() => new EnhancedPricingService());
  const [storageService] = useState(() => new StorageService());
  
  const [routeState, setRouteState] = useState<RouteBuilderState>({
    stops: [
      {
        id: 'stop_1', type: 'pickup', lga: '', address: '',
        lat: 0,
        lng: undefined
      },
      {
        id: 'stop_2', type: 'dropoff', lga: '', address: '',
        lat: 0,
        lng: undefined
      },
    ],
    loadSize: 'semi-full',
    loadWeight: 0,
    pickupTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    isCalculating: false,
  });

  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [routeDistance, setRouteDistance] = useState<number>(0);
  const [routeDuration, setRouteDuration] = useState<number>(0);
  const [fuelData, setFuelData] = useState<FuelData | null>(null);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Calculate enhanced price when route changes
  useEffect(() => {
    const validStops = routeState.stops.filter(stop => stop.lga.trim() !== '');
    
    if (validStops.length >= 2) {
      setRouteState((prev: RouteBuilderState) => ({ ...prev, isCalculating: true }));
      
      // Calculate enhanced pricing with real-time data
      pricingService.calculateEnhancedPrice(
        validStops.map(stop => ({ lga: stop.lga, address: stop.address })),
        routeState.loadSize,
        routeState.loadWeight,
        routeState.pickupTime
      ).then((result) => {
        if (result) {
          setPriceBreakdown(result.breakdown);
          setRouteDistance(result.distance);
          setRouteDuration(result.duration);
          setFuelData(result.fuelData);
        } else {
          setPriceBreakdown(null);
          setRouteDistance(0);
          setRouteDuration(0);
          setFuelData(null);
        }
        setRouteState(prev => ({ ...prev, isCalculating: false }));
      }).catch((error) => {
        console.error('Enhanced pricing calculation failed:', error);
        setRouteState(prev => ({ ...prev, isCalculating: false }));
      });
    } else {
      setPriceBreakdown(null);
      setRouteDistance(0);
      setRouteDuration(0);
      setFuelData(null);
    }
  }, [routeState.stops, routeState.loadSize, routeState.loadWeight, routeState.pickupTime, pricingService]);

  const handleSaveQuote = () => {
    if (!priceBreakdown || !fuelData) return;

    const quote: Quote = {
      id: editingQuote?.id || `quote_${Date.now()}`,
      stops: routeState.stops.filter(stop => stop.lga.trim() !== ''),
      loadSize: routeState.loadSize,
      loadWeight: routeState.loadWeight,
      pickupTime: routeState.pickupTime,
      distance: routeDistance,
      duration: routeDuration,
      price: priceBreakdown.total,
      breakdown: priceBreakdown,
      createdAt: editingQuote?.createdAt || new Date().toISOString(),
      status: 'draft',
      vehicleSpecs: pricingService.getVehicleSpecs(),
      fuelData: fuelData
    };

    storageService.saveQuote(quote);
    setEditingQuote(null);
    alert('Enhanced quote saved successfully!');
  };

  const handleEditQuote = (quote: Quote) => {
    setRouteState({
      stops: quote.stops,
      loadSize: quote.loadSize,
      loadWeight: quote.loadWeight,
      pickupTime: quote.pickupTime,
      isCalculating: false,
    });
    setEditingQuote(quote);
    setActiveTab('calculator');
  };

  const handleNewQuote = () => {
    setRouteState({
      stops: [
        {
          id: 'stop_1', type: 'pickup', lga: '', address: '',
          lat: 0,
          lng: undefined
        },
        {
          id: 'stop_2', type: 'dropoff', lga: '', address: '',
          lat: 0,
          lng: undefined
        },
      ],
      loadSize: 'semi-full',
      loadWeight: 0,
      pickupTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      isCalculating: false,
    });
    setEditingQuote(null);
    setPriceBreakdown(null);
    setRouteDistance(0);
    setRouteDuration(0);
    setFuelData(null);
    setActiveTab('calculator');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Responsive Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Branding */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Nigerian Logistics</h1>
                <p className="text-sm text-gray-600">Enhanced Pricing Calculator</p>
              </div>
            </div>

            {/* Desktop Navigation */}
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

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-green-600 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
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
          <div className="space-y-8">
            {/* Route Builder */}
            <EnhancedRouteBuilder 
              state={routeState} 
              onStateChange={setRouteState}
              vehicleSpecs={pricingService.getVehicleSpecs()}
            />
            
            {/* Maps and Price Calculator Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Google Maps Display */}
        

<ErrorBoundary fallback={<div className="bg-red-50 p-4 rounded-lg">Map failed to load</div>}>
 <GoogleMapsDisplay
  key={`map-${routeState.stops.map(stop => stop.id).join('-')}`}
  stops={routeState.stops.filter(stop => stop.lga.trim() !== '')}
  distance={routeDistance}
  duration={routeDuration}
  className="h-full"
/>
</ErrorBoundary>

              {/* Enhanced Price Calculator */}
              <EnhancedPriceCalculator
                breakdown={priceBreakdown}
                isCalculating={routeState.isCalculating}
                distance={routeDistance}
                duration={routeDuration}
                vehicleSpecs={pricingService.getVehicleSpecs()}
                fuelData={fuelData}
              />
            </div>

            {/* Save Quote Button */}
            {priceBreakdown && (
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleSaveQuote}
                  className="flex-1 max-w-md bg-green-600 text-white py-4 px-8 rounded-lg font-medium hover:bg-green-700 transition-colors text-lg"
                >
                  {editingQuote ? 'Update Enhanced Quote' : 'Save Enhanced Quote'}
                </button>
                {editingQuote && (
                  <button
                    onClick={() => {
                      setEditingQuote(null);
                      handleNewQuote();
                    }}
                    className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            )}
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