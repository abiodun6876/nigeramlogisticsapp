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
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const googleMapsService = new GoogleMapsService();

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    if (map && stops.length >= 2) {
      displayRoute();
    }
  }, [map, stops]);

  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      await googleMapsService.initialize();
      
      const mapInstance = new google.maps.Map(mapRef.current, {
        zoom: 10,
        center: { lat: 6.5244, lng: 3.3792 }, // Lagos center
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      const renderer = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#10B981',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });

      renderer.setMap(mapInstance);
      setMap(mapInstance);
      setDirectionsRenderer(renderer);
    } catch (error) {
      console.error('Failed to initialize Google Maps:', error);
    }
  };

  const displayRoute = async () => {
    if (!map || !directionsRenderer || stops.length < 2) return;

    try {
      const route = await googleMapsService.calculateRoute(stops);
      if (route) {
        // The route calculation already handles the DirectionsRenderer
        // We just need to fit the bounds
        map.fitBounds(route.bounds);
      }
    } catch (error) {
      console.error('Failed to display route:', error);
    }
  };

  const validStops = stops.filter(stop => stop.lga.trim() !== '');

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
        ref={mapRef} 
        className="w-full h-80 bg-gray-100"
        style={{ minHeight: '320px' }}
      >
        {!map && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
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