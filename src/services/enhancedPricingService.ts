import { PricingParams, PriceBreakdown, VehicleSpecs, FuelData } from '../types';
import { GoogleMapsService } from './googleMapsService';
import { FuelPriceService } from './fuelPriceService';

const DEFAULT_VEHICLE_SPECS: VehicleSpecs = {
  name: 'Ford Cargo Van',
  year: 2016,
  fuelConsumption: 15.0, // L/100km (approx for older cargo vans; adjust as needed)
  loadCapacity: 1300,     // kg (adjusted to typical 2016 Ford cargo specs)
  fuelType: 'petrol'
};


const DEFAULT_PRICING_PARAMS: PricingParams = {
  baseRate: 300,
  fuelSurcharge: 1.25,
  profitMarginPercentage: 25,
  loadFactors: {
    half: 1.15,
    'semi-full': 1.25,
    full: 1.4,
  },
  trafficMultipliers: {
    '6': 1.3, '7': 1.8, '8': 2.0, '9': 1.5,
    '17': 1.5, '18': 1.8, '19': 2.0, '20': 1.3,
  },
  vehicleSpecs: DEFAULT_VEHICLE_SPECS,
  lastUpdated: new Date().toISOString(),
};

export class EnhancedPricingService {
  private params: PricingParams;
  private googleMapsService: GoogleMapsService;
  private fuelPriceService: FuelPriceService;

  constructor() {
    this.params = this.loadParams();
    this.googleMapsService = new GoogleMapsService();
    this.fuelPriceService = new FuelPriceService();
  }

  private loadParams(): PricingParams {
    const stored = localStorage.getItem('enhanced_logistics_params');
    return stored ? JSON.parse(stored) : DEFAULT_PRICING_PARAMS;
  }

  updateParams(newParams: Partial<PricingParams>): void {
    this.params = {
      ...this.params,
      ...newParams,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem('enhanced_logistics_params', JSON.stringify(this.params));
  }

  getParams(): PricingParams {
    return { ...this.params };
  }

  async calculateEnhancedPrice(
    stops: Array<{
      lat: number;
      lng: number; lga: string; address: string 
}>,
    loadSize: 'half' | 'semi-full' | 'full',
    loadWeight: number,
    pickupTime: string
  ): Promise<{ breakdown: PriceBreakdown; distance: number; duration: number; fuelData: FuelData } | null> {
    try {
      // Get real-time route data from Google Maps
      const route = await this.googleMapsService.calculateRoute(
        stops.map((stop, index) => ({
          id: `stop_${index}`,
          type: index === 0 ? 'pickup' : 'dropoff',
          lga: stop.lga,
          address: stop.address,
          lat: stop.lat ?? 0,
          lng: stop.lng ?? 0
        }))
      );

      if (!route) return null;

      // Get current fuel price
      const fuelData = await this.fuelPriceService.getCurrentFuelPrice();

      // Calculate traffic multiplier based on pickup time and real-time data
      const hour = new Date(pickupTime).getHours();
      const baseTrafficMultiplier = this.params.trafficMultipliers[hour.toString()] || 1.0;
      const realTimeTrafficMultiplier = await this.googleMapsService.getCurrentTrafficMultiplier(
        stops.map((stop, index) => ({
          id: `stop_${index}`,
          type: index === 0 ? 'pickup' : 'dropoff',
          lga: stop.lga,
          address: stop.address,
          lat: stop.lat ?? 0,
          lng: stop.lng ?? 0
        }))
      );
      
      const trafficMultiplier = Math.max(baseTrafficMultiplier, realTimeTrafficMultiplier);

      // Calculate fuel consumption and cost
      const distance = route.distance;
      const fuelConsumption = (distance / 100) * this.params.vehicleSpecs.fuelConsumption;
      const realFuelCost = fuelConsumption * fuelData.pricePerLiter;

      // Load factor calculation
      const loadFactor = this.params.loadFactors[loadSize];
      const weightFactor = Math.min(loadWeight / this.params.vehicleSpecs.loadCapacity, 1.0);
      const adjustedLoadFactor = loadFactor * (0.8 + 0.4 * weightFactor); // Weight affects fuel consumption

      // Base calculation
      const baseCalculation = distance * this.params.baseRate * trafficMultiplier * adjustedLoadFactor;
      
      // Add real fuel cost
      const subtotal = baseCalculation + realFuelCost;
      
      // Apply fuel surcharge
      const withSurcharge = subtotal * this.params.fuelSurcharge;
      
      // Calculate profit margin
      const profitMargin = withSurcharge * (this.params.profitMarginPercentage / 100);
      const total = Math.round(withSurcharge + profitMargin);
      
      // Calculate break-even price (cost without profit)
      const breakEvenPrice = Math.round(withSurcharge);

      const breakdown: PriceBreakdown = {
        baseDistance: distance,
        adjustedDistance: distance * trafficMultiplier,
        baseRate: this.params.baseRate,
        trafficMultiplier,
        loadFactor: adjustedLoadFactor,
        fuelSurcharge: this.params.fuelSurcharge,
        realFuelCost: Math.round(realFuelCost),
        profitMargin: Math.round(profitMargin),
        baseCalculation: Math.round(baseCalculation),
        subtotal: Math.round(subtotal),
        total,
        breakEvenPrice
      };

      return {
        breakdown,
        distance: route.distance,
        duration: route.duration,
        fuelData
      };
    } catch (error) {
      console.error('Enhanced pricing calculation failed:', error);
      return null;
    }
  }

  getVehicleSpecs(): VehicleSpecs {
    return { ...this.params.vehicleSpecs };
  }

  updateVehicleSpecs(specs: Partial<VehicleSpecs>): void {
    this.params.vehicleSpecs = { ...this.params.vehicleSpecs, ...specs };
    this.updateParams({ vehicleSpecs: this.params.vehicleSpecs });
  }
}