import { PricingParams, PriceBreakdown } from '../types';
import { DISTANCE_MATRIX } from '../data/lgas';

const DEFAULT_PRICING_PARAMS: PricingParams = {
  baseRate: 300,
  fuelSurcharge: 1.25,
  loadFactors: {
    half: 1.15,
    'semi-full': 1.25,
    full: 1.4,
  },
  trafficMultipliers: {
    '6': 1.3, '7': 1.8, '8': 2.0, '9': 1.5, // Morning rush
    '17': 1.5, '18': 1.8, '19': 2.0, '20': 1.3, // Evening rush
  },
  lastUpdated: new Date().toISOString(),
};

export class PricingService {
  private params: PricingParams;

  constructor() {
    this.params = this.loadParams();
  }

  private loadParams(): PricingParams {
    const stored = localStorage.getItem('logistics_params');
    return stored ? JSON.parse(stored) : DEFAULT_PRICING_PARAMS;
  }

  updateParams(newParams: Partial<PricingParams>): void {
    this.params = {
      ...this.params,
      ...newParams,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem('logistics_params', JSON.stringify(this.params));
  }

  getParams(): PricingParams {
    return { ...this.params };
  }

  calculateDistance(fromLGA: string, toLGA: string): number {
    // Try direct lookup
    const direct = DISTANCE_MATRIX[fromLGA]?.[toLGA];
    if (direct) return direct;

    // Try reverse lookup
    const reverse = DISTANCE_MATRIX[toLGA]?.[fromLGA];
    if (reverse) return reverse;

    // Fallback: estimate based on zone
    return this.estimateDistance(fromLGA, toLGA);
  }

  private estimateDistance(fromLGA: string, toLGA: string): number {
    // Simplified distance estimation based on common routes
    const sameZoneDistance = 15;
    const crossMainlandIslandDistance = 25;
    const toOutskirtDistance = 40;

    if (fromLGA === toLGA) return 5;
    
    // This is a simplified estimation - in production, you'd use a proper routing service
    return crossMainlandIslandDistance;
  }

  calculateTotalDistance(stops: Array<{ lga: string }>): number {
    if (stops.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      totalDistance += this.calculateDistance(stops[i].lga, stops[i + 1].lga);
    }
    return totalDistance;
  }

  calculatePrice(
    distance: number,
    loadSize: 'half' | 'semi-full' | 'full',
    pickupTime: string
  ): PriceBreakdown {
    const hour = new Date(pickupTime).getHours();
    const trafficMultiplier = this.params.trafficMultipliers[hour.toString()] || 1.0;
    const loadFactor = this.params.loadFactors[loadSize];
    
    const adjustedDistance = distance * trafficMultiplier;
    const subtotal = adjustedDistance * this.params.baseRate * loadFactor;
    const total = subtotal * this.params.fuelSurcharge;

    return {
      baseDistance: distance,
      adjustedDistance,
      baseRate: this.params.baseRate,
      trafficMultiplier,
      loadFactor,
      fuelSurcharge: this.params.fuelSurcharge,
      subtotal,
      total: Math.round(total),
    };
  }
}