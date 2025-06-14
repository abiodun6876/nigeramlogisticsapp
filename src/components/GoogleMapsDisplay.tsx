import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Clock, Route } from 'lucide-react';
import { Stop } from '../types';
import { GoogleMapsService } from '../services/googleMapsService';

interface GoogleMapsDisplayProps {
  stops: Stop[];
  distance?: number;
  duration?: number;
  className?: string;
}

export const GoogleMapsDisplay: React.FC<GoogleMapsDisplayProps> = ({ 
  stops, 
  distance, 
  duration, 
  className = ""
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const googleMapsService = useRef(new GoogleMapsService());
  const isMounted = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and cleanup map
  useEffect(() => {
    isMounted.current = true;
    let mapInstance: google.maps.Map | null = null;
    let rendererInstance: google.maps.DirectionsRenderer | null = null;

    const initMap = async () => {
      if (!mapContainerRef.current || !isMounted.current) return;

      try {
        await googleMapsService.current.initialize();
        
        if (!isMounted.current) return;

        mapInstance = new google.maps.Map(mapContainerRef.current, {
          zoom: 10,
          center: { lat: 6.5244, lng: 3.3792 },
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [{
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }]
        });

        rendererInstance = new google.maps.DirectionsRenderer({
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#10B981',
            strokeWeight: 4,
            strokeOpacity: 0.8
          }
        });

        rendererInstance.setMap(mapInstance);
        mapRef.current = mapInstance;
        directionsRendererRef.current = rendererInstance;
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize Google Maps:', err);
        setError('Failed to load Google Maps. Please try again.');
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      isMounted.current = false;
      if (rendererInstance) {
        rendererInstance.setMap(null);
        directionsRendererRef.current = null;
      }
      if (mapInstance) {
        google.maps.event.clearInstanceListeners(mapInstance);
        mapRef.current = null;
      }
    };
  }, []);

  // Display route when stops change
  useEffect(() => {
    if (!mapRef.current || !directionsRendererRef.current || stops.length < 2) return;

    const displayRoute = async () => {
      try {
        const route = await googleMapsService.current.calculateRoute(stops);
        if (route && directionsRendererRef.current) {
          directionsRendererRef.current.setDirections(route.directionsResult);
          mapRef.current?.fitBounds(route.bounds);
        }
      } catch (err) {
        console.error('Failed to display route:', err);
        setError('Failed to calculate and display route.');
      }
    };

    displayRoute();
  }, [stops]);

  // Handle window resize
  useEffect(() => {
    if (!mapRef.current) return;

    const handleResize = () => {
      google.maps.event.trigger(mapRef.current!, 'resize');
      if (stops.length >= 2 && directionsRendererRef.current) {
        const bounds = new google.maps.LatLngBounds();
        stops.forEach(stop => {
          if (stop.lat && stop.lng) {
            bounds.extend(new google.maps.LatLng(stop.lat, stop.lng));
          }
        });
        if (!bounds.isEmpty()) {
          mapRef.current?.fitBounds(bounds);
        }
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [stops]);

  const validStops = stops.filter(stop => stop.lga.trim());

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
        <div className="p-4 text-red-500 text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Navigation className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-800">Live Route Map</h3>
        </div>
        
        {distance && duration && (
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <Route className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-600">{distance.toFixed(1)} km</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-600">{Math.round(duration)} min</span>
            </div>
            <div className="text-gray-600">
              {validStops.length} Total Stops
            </div>
          </div>
        )}
      </div>

      <div 
        ref={mapContainerRef}
        className="w-full h-80 bg-gray-100 relative"
        style={{ minHeight: '320px' }}
        dangerouslySetInnerHTML={{ __html: '' }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
              <p className="text-gray-500">Loading Google Maps...</p>
            </div>
          </div>
        )}
      </div>

      {validStops.length >= 2 && (
        <div className="p-4 bg-gray-50">
          <div className="text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Route: {validStops[0].lga} → {validStops[validStops.length - 1].lga}</span>
              <span className="text-xs">Powered by Google Maps</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
