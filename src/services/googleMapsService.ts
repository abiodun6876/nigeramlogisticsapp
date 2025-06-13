import { Loader } from '@googlemaps/js-api-loader';
import { Stop, GoogleMapsRoute } from '../types';

const GOOGLE_MAPS_API_KEY = "AIzaSyD845dpQ62RHqNW83JcyA5YKaRQ05UVl8I";

export class GoogleMapsService {
  private loader: Loader;
  private directionsService: google.maps.DirectionsService | null = null;
  private geocoder: google.maps.Geocoder | null = null;

  constructor() {
    this.loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places", "geometry"]
    });
  }

  async initialize(): Promise<void> {
    await this.loader.load();
    this.directionsService = new google.maps.DirectionsService();
    this.geocoder = new google.maps.Geocoder();
  }

  async geocodeAddress(address: string, lga: string): Promise<{ lat: number; lng: number } | null> {
    if (!this.geocoder) await this.initialize();
    
    const fullAddress = `${address}, ${lga}, Lagos, Nigeria`;
    
    return new Promise((resolve) => {
      this.geocoder!.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          // Fallback to LGA center coordinates
          resolve(this.getLGACoordinates(lga));
        }
      });
    });
  }

  private getLGACoordinates(lga: string): { lat: number; lng: number } {
    const lgaCoordinates: { [key: string]: { lat: number; lng: number } } = {
      'Apapa': { lat: 6.4474, lng: 3.3619 },
      'Ibeju-Lekki': { lat: 6.4281, lng: 3.6588 },
      'Ikeja': { lat: 6.5954, lng: 3.3364 },
      'Victoria Island': { lat: 6.4281, lng: 3.4219 },
      'Lekki': { lat: 6.4474, lng: 3.4783 },
      'Surulere': { lat: 6.4969, lng: 3.3481 },
      'Ikorodu': { lat: 6.6194, lng: 3.5106 },
      'Badagry': { lat: 6.4319, lng: 2.8876 },
      'Agege': { lat: 6.6152, lng: 3.3244 },
      'Alimosho': { lat: 6.5833, lng: 3.2500 },
      'Amuwo-Odofin': { lat: 6.4667, lng: 3.3167 },
      'Eti-Osa': { lat: 6.4281, lng: 3.6588 },
      'Lagos Island': { lat: 6.4541, lng: 3.3947 },
      'Lagos Mainland': { lat: 6.5027, lng: 3.3778 },
      'Mushin': { lat: 6.5244, lng: 3.3439 },
      'Oshodi-Isolo': { lat: 6.5244, lng: 3.3278 },
      'Shomolu': { lat: 6.5392, lng: 3.3844 },
      'Epe': { lat: 6.5833, lng: 3.9833 },
      'Ifako-Ijaiye': { lat: 6.6667, lng: 3.2667 },
      'Kosofe': { lat: 6.4667, lng: 3.3833 },
      'Ajeromi-Ifelodun': { lat: 6.4667, lng: 3.3167 }
    };

    return lgaCoordinates[lga] || { lat: 6.5244, lng: 3.3792 }; // Default to Lagos center
  }

  async calculateRoute(stops: Stop[]): Promise<GoogleMapsRoute | null> {
    if (!this.directionsService || stops.length < 2) return null;

    // Geocode all stops first
    const geocodedStops = await Promise.all(
      stops.map(async (stop) => ({
        ...stop,
        coordinates: await this.geocodeAddress(stop.address, stop.lga)
      }))
    );

    const validStops = geocodedStops.filter(stop => stop.coordinates);
    if (validStops.length < 2) return null;

    const origin = validStops[0].coordinates!;
    const destination = validStops[validStops.length - 1].coordinates!;
    const waypoints = validStops.slice(1, -1).map(stop => ({
      location: new google.maps.LatLng(stop.coordinates!.lat, stop.coordinates!.lng),
      stopover: true
    }));

    return new Promise((resolve) => {
      this.directionsService!.route({
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: false,
        optimizeWaypoints: true,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS
        }
      }, (result, status) => {
        if (status === 'OK' && result) {
          const route = result.routes[0];
          const leg = route.legs[0];
          
          let totalDistance = 0;
          let totalDuration = 0;
          
          route.legs.forEach(leg => {
            totalDistance += leg.distance?.value || 0;
            totalDuration += leg.duration?.value || 0;
          });

          resolve({
            distance: totalDistance / 1000, // Convert to km
            duration: totalDuration / 60, // Convert to minutes
            polyline: route.overview_polyline.points,
            bounds: route.bounds
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  async getCurrentTrafficMultiplier(stops: Stop[]): Promise<number> {
    const route = await this.calculateRoute(stops);
    if (!route) return 1.0;

    // Calculate traffic multiplier based on duration vs optimal time
    const optimalTime = route.distance * 2; // Assume 30km/h optimal speed
    const actualTime = route.duration;
    
    return Math.min(Math.max(actualTime / optimalTime, 1.0), 2.5);
  }
}