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
  const mapInstance = useRef<google.maps.Map | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const googleMapsService = useRef<GoogleMapsService>(new GoogleMapsService());
  const mapWrapperRef = useRef<HTMLDivElement | null>(null);

  // Initialize map
  useEffect(() => {
    let isActive = true;

    const initMap = async () => {
      try {
        await googleMapsService.current.initialize();
        
        if (!isActive || !mapContainerRef.current) return;

        // Create a completely separate DOM node for Google Maps
        const wrapper = document.createElement('div');
        wrapper.style.height = '100%';
        wrapper.style.width = '100%';
        mapContainerRef.current.appendChild(wrapper);
        mapWrapperRef.current = wrapper;

        // Initialize map on the separate DOM node
        const map = new google.maps.Map(wrapper, {
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

        // Initialize directions renderer
        const renderer = new google.maps.DirectionsRenderer({
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#10B981',
            strokeWeight: 4,
            strokeOpacity: 0.8
          }
        });

        renderer.setMap(map);
        mapInstance.current = map;
        directionsRenderer.current = renderer;
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize Google Maps:', err);
        setError('Failed to load Google Maps. Please try again.');
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      isActive = false;
      
      // Clean up Google Maps instances
      if (directionsRenderer.current) {
        directionsRenderer.current.setMap(null);
      }
      
      // Remove the wrapper div manually
      if (mapWrapperRef.current && mapContainerRef.current) {
        mapContainerRef.current.removeChild(mapWrapperRef.current);
      }
      
      mapInstance.current = null;
      directionsRenderer.current = null;
      mapWrapperRef.current = null;
    };
  }, []);

  // Display route when stops change
  useEffect(() => {
    if (!mapInstance.current || !directionsRenderer.current || stops.length < 2) return;

    const displayRoute = async () => {
      try {
        const route = await googleMapsService.current.calculateRoute(stops);
        if (route && directionsRenderer.current) {
          directionsRenderer.current.setDirections(route.directionsResult);
          mapInstance.current?.fitBounds(route.bounds);
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
    if (!mapInstance.current) return;

    const handleResize = () => {
      google.maps.event.trigger(mapInstance.current!, 'resize');
      if (stops.length >= 2 && directionsRenderer.current?.getDirections()) {
        const bounds = new google.maps.LatLngBounds();
        stops.forEach(stop => {
          if (stop.lat && stop.lng) {
            bounds.extend(new google.maps.LatLng(stop.lat, stop.lng));
          }
        });
        if (!bounds.isEmpty()) {
          mapInstance.current?.fitBounds(bounds);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

      {/* Map container - React won't touch its children */}
      <div 
        ref={mapContainerRef}
        className="w-full h-80 bg-gray-100 relative"
        style={{ minHeight: '320px' }}
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