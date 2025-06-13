import React, { useState, useEffect } from 'react';
import { Plus, X, MapPin, Package, Clock, AlertTriangle, Weight, Truck } from 'lucide-react';
import { Stop, RouteBuilderState, VehicleSpecs } from '../types';
import { LAGOS_LGAS } from '../data/lgas';

interface EnhancedRouteBuilderProps {
  state: RouteBuilderState;
  onStateChange: (state: RouteBuilderState) => void;
  vehicleSpecs: VehicleSpecs;
}

export const EnhancedRouteBuilder: React.FC<EnhancedRouteBuilderProps> = ({ 
  state, 
  onStateChange, 
  vehicleSpecs 
}) => {
  const [newStopType, setNewStopType] = useState<'pickup' | 'dropoff'>('pickup');

  const addStop = () => {
    const newStop: Stop = {
      id: `stop_${Date.now()}`,
      type: newStopType,
      lga: '',
      address: '',
    };

    onStateChange({
      ...state,
      stops: [...state.stops, newStop],
    });
  };

  const updateStop = (id: string, updates: Partial<Stop>) => {
    onStateChange({
      ...state,
      stops: state.stops.map(stop => 
        stop.id === id ? { ...stop, ...updates } : stop
      ),
    });
  };

  const removeStop = (id: string) => {
    onStateChange({
      ...state,
      stops: state.stops.filter(stop => stop.id !== id),
    });
  };

  const isRushHour = () => {
    const hour = new Date(state.pickupTime).getHours();
    return (hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20);
  };

  const getLoadPercentage = () => {
    return Math.min((state.loadWeight / vehicleSpecs.loadCapacity) * 100, 100);
  };

  const getLoadStatus = () => {
    const percentage = getLoadPercentage();
    if (percentage < 50) return { color: 'text-green-600', status: 'Light Load' };
    if (percentage < 80) return { color: 'text-yellow-600', status: 'Moderate Load' };
    if (percentage < 100) return { color: 'text-orange-600', status: 'Heavy Load' };
    return { color: 'text-red-600', status: 'Overloaded' };
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-semibold text-gray-800">Enhanced Route Builder</h2>
      </div>

      {/* Vehicle Info */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-blue-800">Vehicle: {vehicleSpecs.name} ({vehicleSpecs.year})</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
          <div>Fuel Consumption: {vehicleSpecs.fuelConsumption}L/100km</div>
          <div>Max Capacity: {vehicleSpecs.loadCapacity}kg</div>
        </div>
      </div>

      {/* Stops List */}
      <div className="space-y-4 mb-6">
        {state.stops.map((stop, index) => (
          <div key={stop.id} className="relative">
            <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
              {/* Step Number */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white ${
                stop.type === 'pickup' ? 'bg-blue-500' : 'bg-green-500'
              }`}>
                {index + 1}
              </div>

              {/* Stop Details */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-4">
                  <select
                    value={stop.type}
                    onChange={(e) => updateStop(stop.id, { type: e.target.value as 'pickup' | 'dropoff' })}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium"
                  >
                    <option value="pickup">Pickup</option>
                    <option value="dropoff">Dropoff</option>
                  </select>
                  <Package className={`w-4 h-4 ${stop.type === 'pickup' ? 'text-blue-500' : 'text-green-500'}`} />
                </div>

                <select
                  value={stop.lga}
                  onChange={(e) => updateStop(stop.id, { lga: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select Location (Lagos LGA)</option>
                  {LAGOS_LGAS.map(lga => (
                    <option key={lga.name} value={lga.name}>
                      {lga.name} ({lga.zone})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Enter specific address (for precise GPS routing)"
                  value={stop.address}
                  onChange={(e) => updateStop(stop.id, { address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeStop(stop.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                disabled={state.stops.length <= 2}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Connector Line */}
            {index < state.stops.length - 1 && (
              <div className="w-px h-4 bg-gray-300 mx-4 my-1"></div>
            )}
          </div>
        ))}
      </div>

      {/* Add Stop */}
      <div className="flex items-center gap-4 mb-6">
        <select
          value={newStopType}
          onChange={(e) => setNewStopType(e.target.value as 'pickup' | 'dropoff')}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="pickup">Pickup</option>
          <option value="dropoff">Dropoff</option>
        </select>
        <button
          onClick={addStop}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Stop
        </button>
      </div>

      {/* Load Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Load Size
          </label>
          <select
            value={state.loadSize}
            onChange={(e) => onStateChange({ ...state, loadSize: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="half">Half Load (×1.15)</option>
            <option value="semi-full">Semi-Full (×1.25)</option>
            <option value="full">Full Load (×1.40)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Weight className="w-4 h-4 inline mr-1" />
            Current Load Weight (kg)
          </label>
          <input
            type="number"
            min="0"
            max={vehicleSpecs.loadCapacity}
            value={state.loadWeight}
            onChange={(e) => onStateChange({ ...state, loadWeight: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <div className="mt-1 text-xs text-gray-500">
            Max capacity: {vehicleSpecs.loadCapacity}kg (affects fuel consumption)
          </div>
          <div className="mt-1">
            <div className="flex items-center justify-between text-xs">
              <span className={getLoadStatus().color}>{getLoadStatus().status}</span>
              <span>{getLoadPercentage().toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className={`h-2 rounded-full transition-all ${
                  getLoadPercentage() < 50 ? 'bg-green-500' :
                  getLoadPercentage() < 80 ? 'bg-yellow-500' :
                  getLoadPercentage() < 100 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(getLoadPercentage(), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Pickup Time
          </label>
          <input
            type="datetime-local"
            value={state.pickupTime}
            onChange={(e) => onStateChange({ ...state, pickupTime: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          {isRushHour() && (
            <div className="flex items-center gap-1 mt-1 text-amber-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              Rush hour - Expect traffic delays & higher rates
            </div>
          )}
        </div>
      </div>
    </div>
  );
};