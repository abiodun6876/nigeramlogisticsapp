export interface LGA {
  name: string;
  zone: 'mainland' | 'island' | 'outskirt';
}

export interface Stop {
  lat: number;
  lng: number | boolean | null | undefined;
  id: string;
  type: 'pickup' | 'dropoff';
  lga: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Quote {
  id: string;
  stops: Stop[];
  loadSize: 'half' | 'semi-full' | 'full';
  loadWeight: number;
  pickupTime: string;
  distance: number;
  duration: number;
  price: number;
  breakdown: PriceBreakdown;
  createdAt: string;
  status: 'draft' | 'confirmed' | 'completed';
  vehicleSpecs: VehicleSpecs;
  fuelData: FuelData;
}

export interface PriceBreakdown {
  baseDistance: number;
  adjustedDistance: number;
  baseRate: number;
  trafficMultiplier: number;
  loadFactor: number;
  fuelSurcharge: number;
  realFuelCost: number;
  profitMargin: number;
  baseCalculation: number;
  subtotal: number;
  total: number;
  breakEvenPrice: number;
}

export interface VehicleSpecs {
  name: string;
  year: number;
  fuelConsumption: number; // L/100km
  loadCapacity: number; // kg
  fuelType: 'petrol' | 'diesel';
}

export interface FuelData {
  pricePerLiter: number;
  currency: string;
  lastUpdated: string;
  source: string;
}

export interface PricingParams {
  baseRate: number;
  fuelSurcharge: number;
  profitMarginPercentage: number;
  loadFactors: {
    half: number;
    'semi-full': number;
    full: number;
  };
  trafficMultipliers: {
    [hour: string]: number;
  };
  vehicleSpecs: VehicleSpecs;
  lastUpdated: string;
}

export interface RouteBuilderState {
  stops: Stop[];
  loadSize: 'half' | 'semi-full' | 'full';
  loadWeight: number;
  pickupTime: string;
  isCalculating: boolean;
}



export interface GoogleMapsRoute {
  directionsResult: google.maps.DirectionsResult | null;
  distance: number; // in km
  duration: number; // in minutes
  polyline: string;
  bounds: google.maps.LatLngBounds;
  directions: {
    result: google.maps.DirectionsResult;
    routes: google.maps.DirectionsRoute[];
    waypoints: google.maps.DirectionsGeocodedWaypoint[];
  };
}

export interface DirectionsResponse {
  routes: google.maps.DirectionsRoute[];
  geocoded_waypoints: google.maps.DirectionsGeocodedWaypoint[];
  request: any; // You can define a more specific type if needed
}