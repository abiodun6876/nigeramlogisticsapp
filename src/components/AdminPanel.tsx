import React, { useState, useEffect } from 'react';
import { Settings, Fuel, DollarSign, Clock, Save } from 'lucide-react';
import { PricingParams } from '../types';
import { PricingService } from '../services/pricingService';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [params, setParams] = useState<PricingParams | null>(null);
  const [pricingService] = useState(() => new PricingService());

  useEffect(() => {
    if (isOpen) {
      setParams(pricingService.getParams());
    }
  }, [isOpen, pricingService]);

  const handleSave = () => {
    if (params) {
      pricingService.updateParams(params);
      alert('Parameters updated successfully!');
      onClose();
    }
  };

  if (!isOpen || !params) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">Admin Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Base Rate */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4" />
              Base Rate (₦/km)
            </label>
            <input
              type="number"
              value={params.baseRate}
              onChange={(e) => setParams({ ...params, baseRate: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Fuel Surcharge */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Fuel className="w-4 h-4" />
              Fuel Surcharge Multiplier
            </label>
            <input
              type="number"
              step="0.01"
              value={params.fuelSurcharge}
              onChange={(e) => setParams({ ...params, fuelSurcharge: parseFloat(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Current surcharge: {((params.fuelSurcharge - 1) * 100).toFixed(0)}%
            </p>
          </div>

          {/* Load Factors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Load Size Multipliers</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Half Load</label>
                <input
                  type="number"
                  step="0.01"
                  value={params.loadFactors.half}
                  onChange={(e) => setParams({ 
                    ...params, 
                    loadFactors: { ...params.loadFactors, half: parseFloat(e.target.value) || 1 }
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Semi-Full</label>
                <input
                  type="number"
                  step="0.01"
                  value={params.loadFactors['semi-full']}
                  onChange={(e) => setParams({ 
                    ...params, 
                    loadFactors: { ...params.loadFactors, 'semi-full': parseFloat(e.target.value) || 1 }
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Full Load</label>
                <input
                  type="number"
                  step="0.01"
                  value={params.loadFactors.full}
                  onChange={(e) => setParams({ 
                    ...params, 
                    loadFactors: { ...params.loadFactors, full: parseFloat(e.target.value) || 1 }
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Traffic Multipliers */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Clock className="w-4 h-4" />
              Traffic Multipliers by Hour
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(params.trafficMultipliers).map(([hour, multiplier]) => (
                <div key={hour}>
                  <label className="block text-xs text-gray-600 mb-1">
                    {hour}:00
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={multiplier}
                    onChange={(e) => setParams({ 
                      ...params, 
                      trafficMultipliers: { 
                        ...params.trafficMultipliers, 
                        [hour]: parseFloat(e.target.value) || 1 
                      }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-xs text-gray-500">
            Last updated: {new Date(params.lastUpdated).toLocaleString()}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};