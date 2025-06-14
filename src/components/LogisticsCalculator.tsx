import React, { useState, useEffect } from 'react';
import { 
  Calculator, Fuel, Clock, Package2, MapPin, 
  TrendingUp, TrendingDown, Phone, Truck,
  Settings, HelpCircle, Menu, X,
  FileText
} from 'lucide-react';
import { LoadScript, GoogleMap, DirectionsService, DirectionsRenderer, Marker } from '@react-google-maps/api';

// Types
interface LocationData {
  address: {
    address: string;
    latitude: number;
    longitude: number;
  };
}

interface PriceBreakdown {
  baseDistance: number;
  adjustedDistance: number;
  baseRate: number;
  trafficMultiplier: number;
  loadFactor: number;
  fuelSurcharge: number;
  subtotal: number;
  total: number;
}

const containerStyle = {
  width: '100%',
  height: '400px'
};

const LogisticsCalculator = () => {
  // State
  const [activeTab, setActiveTab] = useState<'calculator' | 'quotes'>('calculator');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [locationId, setLocationId] = useState<string>('');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [stateName, setStateName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loadSize, setLoadSize] = useState<'half' | 'semi-full' | 'full'>('half');
  const [pickupTime, setPickupTime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [negotiationPrice, setNegotiationPrice] = useState<string>('');
  const [profitAnalysis, setProfitAnalysis] = useState<{
    difference: number;
    isProfitable: boolean;
    marginPercentage: number;
  } | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [duration, setDuration] = useState<string>('');
  const [directions, setDirections] = useState<any>(null);

  // Your warehouse location
  const warehouseLocation = {
    lat: 6.5244, // Lagos coordinates
    lng: 3.3792
  };

  // Fetch location and calculate distance
  useEffect(() => {
    const getLocationAndDistance = async () => {
      if (!locationId) return;

      setIsCalculating(true);
      try {
        // 1. Fetch delivery location
        const response = await fetch(`https://api.peakreachdelivery.com/api/v1/locations/delivery-address/${locationId}`);
        const data = await response.json();
        setLocationData(data);
        
        // 2. Calculate distance using Google Maps
        if (window.google) {
          const service = new window.google.maps.DistanceMatrixService();
          service.getDistanceMatrix(
            {
              origins: [warehouseLocation],
              destinations: [{
                lat: data.address.latitude,
                lng: data.address.longitude
              }],
              travelMode: window.google.maps.TravelMode.DRIVING,
              drivingOptions: {
                departureTime: new Date(),
                trafficModel: window.google.maps.TrafficModel.BEST_GUESS
              },
            },
            (response, status) => {
              if (
                status === 'OK' &&
                response &&
                response.rows &&
                response.rows[0] &&
                response.rows[0].elements &&
                response.rows[0].elements[0] &&
                response.rows[0].elements[0].distance &&
                response.rows[0].elements[0].duration
              ) {
                const distanceInKm = response.rows[0].elements[0].distance.value / 1000;
                const durationText = response.rows[0].elements[0].duration.text;
                
                setDistance(distanceInKm);
                setDuration(durationText);
                calculatePrice(distanceInKm);
              } else {
                console.error('DistanceMatrix request failed:', status, response);
              }
              setIsCalculating(false);
            }
          );
        }
      } catch (err) {
        console.error('Error:', err);
        setIsCalculating(false);
      }
    };

    getLocationAndDistance();
  }, [locationId]);

  // Calculate price based on distance and parameters
  const calculatePrice = (distance: number) => {
    const trafficFactor = getTrafficFactor(new Date(pickupTime));
    const adjustedDistance = distance * trafficFactor;
    
    let baseRate = 300; // ₦/km
    let loadFactor = 1.0;
    let fuelSurcharge = 1.15; // Default 15%
    
    switch (loadSize) {
      case 'half':
        loadFactor = 0.5;
        fuelSurcharge = 1.15;
        break;
      case 'semi-full':
        loadFactor = 0.75;
        fuelSurcharge = 1.25;
        break;
      case 'full':
        loadFactor = 1.0;
        fuelSurcharge = 1.4;
        break;
    }
    
    const subtotal = adjustedDistance * baseRate * loadFactor;
    const total = subtotal * fuelSurcharge;
    
    setBreakdown({
      baseDistance: distance,
      adjustedDistance,
      baseRate,
      trafficMultiplier: trafficFactor,
      loadFactor,
      fuelSurcharge,
      subtotal,
      total
    });
  };

  // Traffic factor based on time
  const getTrafficFactor = (time: Date): number => {
    const hour = time.getHours();
    if (hour >= 7 && hour <= 10) return 1.5; // Morning rush
    if (hour >= 16 && hour <= 19) return 1.5; // Evening rush
    return 1.0;
  };

  // Profit analysis for negotiation
  useEffect(() => {
    if (breakdown && negotiationPrice) {
      const negotiatedValue = parseFloat(negotiationPrice.replace(/,/g, ''));
      const difference = negotiatedValue - breakdown.total;
      const marginPercentage = (difference / breakdown.total) * 100;
      
      setProfitAnalysis({
        difference: Math.abs(difference),
        isProfitable: difference >= 0,
        marginPercentage
      });
    } else {
      setProfitAnalysis(null);
    }
  }, [negotiationPrice, breakdown]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setNegotiationPrice(value ? parseFloat(value).toLocaleString() : '');
  };

  // Directions callback
  const directionsCallback = (response: any) => {
    if (response !== null && response.status === 'OK') {
      setDirections(response);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Nigerian Logistics</h1>
                <p className="text-sm text-gray-600">Pricing Calculator</p>
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
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
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
        <LoadScript googleMapsApiKey="AIzaSyD845dpQ62RHqNW83JcyA5YKaRQ05UVl8I" libraries={['places', 'geometry']}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Route Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={locationId}
                      onChange={(e) => setLocationId(e.target.value)}
                    >
                      <option value="">Select pickup location</option>
                      <option value="ikeja">Ikeja</option>
                      <option value="victoria-island">Victoria Island</option>
                      <option value="lekki">Lekki</option>
                      <option value="surulere">Surulere</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Load Size</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setLoadSize('half')}
                        className={`py-2 px-3 rounded-md border transition-colors ${
                          loadSize === 'half' 
                            ? 'bg-green-100 border-green-500 text-green-700' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Half
                      </button>
                      <button
                        onClick={() => setLoadSize('semi-full')}
                        className={`py-2 px-3 rounded-md border transition-colors ${
                          loadSize === 'semi-full' 
                            ? 'bg-amber-100 border-amber-500 text-amber-700' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Semi-Full
                      </button>
                      <button
                        onClick={() => setLoadSize('full')}
                        className={`py-2 px-3 rounded-md border transition-colors ${
                          loadSize === 'full' 
                            ? 'bg-red-100 border-red-500 text-red-700' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Full
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Time</label>
                    <input
                      type="datetime-local"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    {pickupTime && (
                      <p className="mt-1 text-xs text-gray-500">
                        {getTrafficFactor(new Date(pickupTime)) > 1 
                          ? '⚠️ Rush hour pricing applies' 
                          : 'Normal traffic conditions'}
                      </p>
                    )}
                  </div>

                  {locationData && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Delivery Address</span>
                      </div>
                      <p className="text-gray-800">{locationData.address.address}</p>
                      <p className="text-sm text-gray-600 mt-1">State: {stateName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Panel (Conditional) */}
              {showAdminPanel && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Admin Settings</h2>
                    <button 
                      onClick={() => setShowAdminPanel(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Base Rate (₦/km)</label>
                      <input
                        type="number"
                        defaultValue="300"
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Surcharge (%)</label>
                      <input
                        type="number"
                        defaultValue="15"
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <button className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                      Save Settings
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Results */}
            <div className="lg:col-span-2 space-y-6">
              {/* Price Calculator */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                {isCalculating ? (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <Calculator className="w-6 h-6 text-green-600 animate-spin" />
                      <h2 className="text-xl font-semibold text-gray-800">Calculating Price...</h2>
                    </div>
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ) : !breakdown ? (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <Calculator className="w-6 h-6 text-green-600" />
                      <h2 className="text-xl font-semibold text-gray-800">Price Calculator</h2>
                    </div>
                    <div className="text-center py-8 text-gray-500">
                      <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Configure your route to see pricing</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <Calculator className="w-6 h-6 text-green-600" />
                      <h2 className="text-xl font-semibold text-gray-800">Price Breakdown</h2>
                    </div>

                    {/* Distance Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Route Information</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Base Distance:</span>
                        <span className="font-medium">{breakdown.baseDistance.toFixed(1)} km</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600">Traffic Adjusted:</span>
                        <span className="font-medium">{breakdown.adjustedDistance.toFixed(1)} km</span>
                      </div>
                      {duration && (
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-600">Estimated Duration:</span>
                          <span className="font-medium">{duration}</span>
                        </div>
                      )}
                    </div>

                    {/* Pricing Factors */}
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700">Base Rate</span>
                        </div>
                        <span className="font-medium">₦{breakdown.baseRate}/km</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span className="text-gray-700">Traffic Multiplier</span>
                        </div>
                        <span className="font-medium">{breakdown.trafficMultiplier}×</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Package2 className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Load Factor</span>
                        </div>
                        <span className="font-medium">{breakdown.loadFactor}×</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Fuel className="w-4 h-4 text-red-500" />
                          <span className="text-gray-700">Fuel Surcharge</span>
                        </div>
                        <span className="font-medium">{((breakdown.fuelSurcharge - 1) * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Subtotal:</span>
                        <span>₦{breakdown.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600">
                        <span>With Fuel Surcharge:</span>
                        <span>₦{(breakdown.subtotal * breakdown.fuelSurcharge).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-2xl font-bold text-green-600 pt-2 border-t">
                        <span>Total Price:</span>
                        <span>₦{breakdown.total.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Negotiation Section */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <h3 className="font-medium text-blue-800">Customer Negotiation</h3>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-600">Client's Offer:</span>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={negotiationPrice}
                            onChange={handlePriceChange}
                            placeholder="Enter negotiated price"
                            className="w-full pl-8 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="absolute left-3 top-2.5 text-gray-400">₦</span>
                        </div>
                      </div>

                      {profitAnalysis && (
                        <div className={`p-3 rounded-md ${profitAnalysis.isProfitable ? 'bg-green-50' : 'bg-red-50'}`}>
                          <div className="flex items-center gap-2">
                            {profitAnalysis.isProfitable ? (
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-600" />
                            )}
                            <span className={`font-medium ${profitAnalysis.isProfitable ? 'text-green-800' : 'text-red-800'}`}>
                              {profitAnalysis.isProfitable ? 'Profitable' : 'Not Profitable'}
                            </span>
                          </div>
                          
                          <div className="mt-1 text-sm">
                            <span className={profitAnalysis.isProfitable ? 'text-green-700' : 'text-red-700'}>
                              {profitAnalysis.isProfitable ? '+' : '-'}₦{profitAnalysis.difference.toLocaleString()} 
                              <span className="text-xs ml-1">({profitAnalysis.marginPercentage.toFixed(1)}%)</span>
                            </span>
                            
                            <div className="text-xs mt-1 text-gray-600">
                              {profitAnalysis.isProfitable ? (
                                <span>Above minimum price</span>
                              ) : (
                                <span>Below minimum by ₦{profitAnalysis.difference.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 text-xs text-gray-500">
                        <p>Tip: Our minimum profitable price is ₦{breakdown.total.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Calculation Formula */}
                    <div className="mt-6 p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800 font-medium mb-2">Calculation Formula:</p>
                      <p className="text-xs text-green-700 font-mono">
                        ({breakdown.baseDistance}km × {breakdown.trafficMultiplier} × ₦{breakdown.baseRate} × {breakdown.loadFactor}) × {breakdown.fuelSurcharge}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Map */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Route Map</h2>
                {locationData ? (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={{
                      lat: locationData.address.latitude,
                      lng: locationData.address.longitude,
                    }}
                    zoom={15}
                    options={{
                      disableDefaultUI: true,
                      styles: [
                        {
                          featureType: 'poi',
                          elementType: 'labels',
                          stylers: [{ visibility: 'off' }]
                        }
                      ]
                    }}
                  >
                    <Marker position={warehouseLocation} label="W" />
                    <Marker position={{
                      lat: locationData.address.latitude,
                      lng: locationData.address.longitude
                    }} />
                    
                    <DirectionsService
                      options={{
                        destination: {
                          lat: locationData.address.latitude,
                          lng: locationData.address.longitude
                        },
                        origin: warehouseLocation,
                        travelMode: window.google.maps.TravelMode.DRIVING,
                        drivingOptions: {
                          departureTime: new Date(pickupTime),
                          trafficModel: window.google.maps.TrafficModel.BEST_GUESS
                        }
                      }}
                      callback={directionsCallback}
                    />
                    
                    {directions && (
                      <DirectionsRenderer options={{ directions }} />
                    )}
                  </GoogleMap>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Configure your route to see the map</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </LoadScript>

        {/* User Guide Modal */}
        {showUserGuide && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">User Guide</h2>
                  <button 
                    onClick={() => setShowUserGuide(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="prose prose-sm text-gray-600">
                  <h3>How to Use the Pricing Calculator</h3>
                  <ol>
                    <li>Select the pickup location from the dropdown</li>
                    <li>Choose the appropriate load size</li>
                    <li>Set the pickup date and time (affects traffic pricing)</li>
                    <li>Review the calculated price breakdown</li>
                    <li>Use the negotiation section when speaking with customers</li>
                  </ol>
                  
                  <h3>Understanding the Pricing</h3>
                  <p>The total price is calculated based on:</p>
                  <ul>
                    <li><strong>Distance:</strong> Actual driving distance from warehouse</li>
                    <li><strong>Traffic:</strong> Rush hour multipliers (7-10am, 4-7pm)</li>
                    <li><strong>Load Size:</strong> Half, Semi-Full, or Full load</li>
                    <li><strong>Fuel Surcharge:</strong> Current fuel price adjustment</li>
                  </ul>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => setShowUserGuide(false)}
                    className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LogisticsCalculator;