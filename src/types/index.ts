export interface LGA {
  name: string;
  zone: 'mainland' | 'island' | 'outskirt';
}

export interface Stop {
  id: string;
  type: 'pickup' | 'dropoff';
  lga: string;
  address: string;
}

export interface Quote {
  id: string;
  stops: Stop[];
  loadSize: 'half' | 'semi-full' | 'full';
  pickupTime: string;
  distance: number;
  price: number;
  breakdown: PriceBreakdown;
  createdAt: string;
  status: 'draft' | 'confirmed' | 'completed';
}

export interface PriceBreakdown {
  baseDistance: number;
  adjustedDistance: number;
  baseRate: number;
  trafficMultiplier: number;
  loadFactor: number;
  fuelSurcharge: number;
  subtotal: number;
  total: number;
}

export interface PricingParams {
  baseRate: number;
  fuelSurcharge: number;
  loadFactors: {
    half: number;
    'semi-full': number;
    full: number;
  };
  trafficMultipliers: {
    [hour: string]: number;
  };
  lastUpdated: string;
}

export interface RouteBuilderState {
  stops: Stop[];
  loadSize: 'half' | 'semi-full' | 'full';
  pickupTime: string;
  isCalculating: boolean;
}