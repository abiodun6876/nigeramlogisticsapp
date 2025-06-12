import React, { useState, useEffect } from 'react';
import { Calculator, Fuel, Clock, Package2, MapPin, TrendingUp, TrendingDown, Phone } from 'lucide-react';
import { PriceBreakdown } from '../types';

interface PriceCalculatorProps {
  breakdown: PriceBreakdown | null;
  isCalculating: boolean;
  distance: number;
}

export const PriceCalculator: React.FC<PriceCalculatorProps> = ({ 
  breakdown, 
  isCalculating, 
  distance 
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

  if (isCalculating) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
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
    );
  }

  if (!breakdown) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">Price Calculator</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Configure your route to see pricing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-semibold text-gray-800">Price Breakdown</h2>
      </div>

      {/* Distance Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Route Distance</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Base Distance:</span>
          <span className="font-medium">{breakdown.baseDistance.toFixed(1)} km</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Traffic Adjusted:</span>
          <span className="font-medium">{breakdown.adjustedDistance.toFixed(1)} km</span>
        </div>
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
  );
};