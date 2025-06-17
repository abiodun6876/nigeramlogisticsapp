import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Fuel, 
  Clock, 
  Package2, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Phone,
  Truck,
  DollarSign,
  BarChart3,
  Zap
} from 'lucide-react';
import { PriceBreakdown, VehicleSpecs, FuelData } from '../types';

interface EnhancedPriceCalculatorProps {
  breakdown: PriceBreakdown | null;
  isCalculating: boolean;
  distance: number;
  duration: number;
  vehicleSpecs: VehicleSpecs;
  fuelData: FuelData | null;
}

export const EnhancedPriceCalculator: React.FC<EnhancedPriceCalculatorProps> = ({ 
  breakdown, 
  isCalculating, 
  distance,
  duration,
  vehicleSpecs,
  fuelData
}) => {
  const [negotiationPrice, setNegotiationPrice] = useState<string>('');
  const [profitAnalysis, setProfitAnalysis] = useState<{
    difference: number;
    isProfitable: boolean;
    marginPercentage: number;
  } | null>(null);

  useEffect(() => {
    if (breakdown && negotiationPrice) {
      const negotiatedValue = parseFloat(negotiationPrice.replace(/,/g, ''));
      const difference = negotiatedValue - breakdown.breakEvenPrice;
      const marginPercentage = (difference / breakdown.breakEvenPrice) * 100;
      
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

  if (isCalculating) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-6 h-6 text-green-600 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-800">Calculating Enhanced Price...</h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!breakdown || !fuelData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">Price Calculator</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Configure your route to see pricing</p>
          <p className="text-sm mt-2">Includes Google Maps data, live fuel prices, and vehicle specs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Price Breakdown Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">Price Breakdown</h2>
        </div>

        {/* Google Maps Data & Live Fuel Price */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-800">Google Maps Data</h4>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Distance:</span>
                <span className="font-medium text-green-800">{distance.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Duration:</span>
                <span className="font-medium text-green-800">{Math.round(duration)} min</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Fuel className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-800">Live Fuel Price</h4>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Current Rate:</span>
                <span className="font-medium text-blue-800">₦{fuelData.pricePerLiter}/L</span>
              </div>
              <div className="text-xs text-blue-600">
                {fuelData.source === 'Cached' ? 'Cached' : 'Live'} • Updated: {new Date(fuelData.lastUpdated).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Specifications */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-800">Vehicle Specifications</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Vehicle:</span>
              <span className="font-medium ml-2">{vehicleSpecs.name} ({vehicleSpecs.year})</span>
            </div>
            <div>
              <span className="text-gray-600">Fuel Consumption:</span>
              <span className="font-medium ml-2">{vehicleSpecs.fuelConsumption}L/100km</span>
            </div>
            <div>
              <span className="text-gray-600">Load Capacity:</span>
              <span className="font-medium ml-2">{vehicleSpecs.loadCapacity}kg</span>
            </div>
            <div>
              <span className="text-gray-600">Fuel Type:</span>
              <span className="font-medium ml-2 capitalize">{vehicleSpecs.fuelType}</span>
            </div>
          </div>
        </div>

        {/* Pricing Factors */}
        <div className="space-y-3 mb-6">
          <h4 className="font-semibold text-gray-800">Pricing Factors</h4>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-700">Base Rate</span>
            <span className="font-medium">₦{breakdown.baseRate}/km</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-gray-700">Traffic Multiplier</span>
            </div>
            <span className="font-medium">{breakdown.trafficMultiplier.toFixed(1)}×</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Package2 className="w-4 h-4 text-green-500" />
              <span className="text-gray-700">Load Factor</span>
            </div>
            <span className="font-medium">{breakdown.loadFactor.toFixed(2)}×</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Fuel className="w-4 h-4 text-red-500" />
              <span className="text-gray-700">Real Fuel Cost</span>
            </div>
            <span className="font-medium">₦{breakdown.realFuelCost.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-500" />
              <span className="text-gray-700">Profit Margin</span>
            </div>
            <span className="font-medium text-green-600">+₦{breakdown.profitMargin.toLocaleString()}</span>
          </div>
        </div>

        {/* Price Summary */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex justify-between items-center text-gray-600">
            <span>Base Calculation:</span>
            <span>₦{breakdown.baseCalculation.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span>+ Fuel Cost:</span>
            <span>₦{breakdown.realFuelCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span>Subtotal:</span>
            <span>₦{breakdown.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span>× Fuel Surcharge ({((breakdown.fuelSurcharge - 1) * 100).toFixed(0)}%):</span>
            <span>₦{(breakdown.subtotal * breakdown.fuelSurcharge).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-2xl font-bold text-green-600 pt-3 border-t">
            <span>Total Price:</span>
            <span>₦{breakdown.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-blue-600">
            <span>Break-even Price:</span>
            <span>₦{breakdown.breakEvenPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Customer Negotiation Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Customer Negotiation</h3>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-gray-600 whitespace-nowrap">Client's Offer:</span>
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
          <div className={`p-4 rounded-lg ${profitAnalysis.isProfitable ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              {profitAnalysis.isProfitable ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
              <span className={`font-medium ${profitAnalysis.isProfitable ? 'text-green-800' : 'text-red-800'}`}>
                {profitAnalysis.isProfitable ? 'Profitable Deal' : 'Loss-Making Deal'}
              </span>
            </div>
            
            <div className="text-sm space-y-1">
              <div className={profitAnalysis.isProfitable ? 'text-green-700' : 'text-red-700'}>
                {profitAnalysis.isProfitable ? 'Profit: +' : 'Loss: -'}₦{profitAnalysis.difference.toLocaleString()} 
                <span className="text-xs ml-1">({profitAnalysis.marginPercentage.toFixed(1)}% margin)</span>
              </div>
              
              <div className="text-xs text-gray-600">
                {profitAnalysis.isProfitable ? (
                  <span>Above break-even price of ₦{breakdown.breakEvenPrice.toLocaleString()}</span>
                ) : (
                  <span>Below break-even by ₦{profitAnalysis.difference.toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Recommendation:</strong> Minimum profitable price is ₦{breakdown.total.toLocaleString()}. 
            Break-even price is ₦{breakdown.breakEvenPrice.toLocaleString()}.
          </p>
        </div>
      </div>

      {/* Enhanced Calculation Formula */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-semibold text-green-800 mb-3"> Calculation Formula:</h3>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-700 font-mono mb-2">
            (({distance.toFixed(1)}km × {breakdown.trafficMultiplier.toFixed(1)} × ₦{breakdown.baseRate} × {breakdown.loadFactor.toFixed(2)}) + ₦{breakdown.realFuelCost.toLocaleString()} fuel) × {breakdown.fuelSurcharge} + ₦{breakdown.profitMargin.toLocaleString()} profit
          </p>
          <p className="text-xs text-green-600 mt-2">
            Using real-time Google Maps distance, current fuel prices (₦{fuelData.pricePerLiter}/L), and {vehicleSpecs.year} {vehicleSpecs.name} specifications
          </p>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <strong>Fuel prices updated:</strong><br />
            {new Date(fuelData.lastUpdated).toLocaleString()}
          </div>
          <div>
            <strong>Route calculated:</strong><br />
            {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};