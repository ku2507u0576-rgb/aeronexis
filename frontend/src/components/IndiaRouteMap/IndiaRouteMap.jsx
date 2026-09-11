import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './IndiaRouteMap.css';

// Exact GPS coordinates of major Indian airports
export const AIRPORT_COORDS = {
  DEL: { lat: 28.5562, lng: 77.1000, city: 'Delhi', name: 'Indira Gandhi Intl', code: 'DEL', state: 'Delhi NCR' },
  BOM: { lat: 19.0896, lng: 72.8656, city: 'Mumbai', name: 'Chhatrapati Shivaji Intl', code: 'BOM', state: 'Maharashtra' },
  BLR: { lat: 13.1986, lng: 77.7066, city: 'Bengaluru', name: 'Kempegowda Intl', code: 'BLR', state: 'Karnataka' },
  HYD: { lat: 17.2403, lng: 78.4294, city: 'Hyderabad', name: 'Rajiv Gandhi Intl', code: 'HYD', state: 'Telangana' },
  MAA: { lat: 12.9941, lng: 80.1709, city: 'Chennai', name: 'Chennai Intl', code: 'MAA', state: 'Tamil Nadu' },
  CCU: { lat: 22.6547, lng: 88.4467, city: 'Kolkata', name: 'Netaji Subhas Intl', code: 'CCU', state: 'West Bengal' },
};

// All 10 Tier-1 monitored routes
const MONITORED_ROUTES = [
  ['DEL', 'BOM'], ['DEL', 'BLR'], ['BOM', 'BLR'],
  ['DEL', 'HYD'], ['BLR', 'HYD'], ['MAA', 'DEL'],
  ['DEL', 'CCU'], ['BOM', 'DEL'], ['MAA', 'BOM'], ['BLR', 'DEL']
];

// Generate intermediate points with geodesic curve for realistic flight path
function getFlightCurvePoints(p1, p2, numPoints = 60, bendFactor = 0.18) {
  const points = [];
  const midLat = (p1.lat + p2.lat) / 2;
  const midLng = (p1.lng + p2.lng) / 2;
  
  // Perpendicular vector for arc bend
  const dLat = p2.lat - p1.lat;
  const dLng = p2.lng - p1.lng;
  const dist = Math.hypot(dLat, dLng);
  
  // Normal vector pointing "upward/eastward"
  const nLat = -dLng / (dist || 1);
  const nLng = dLat / (dist || 1);
  
  // Peak control point
  const ctrlLat = midLat + nLat * dist * bendFactor;
  const ctrlLng = midLng + nLng * dist * bendFactor;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Quadratic Bezier interpolation
    const lat = (1 - t) * (1 - t) * p1.lat + 2 * (1 - t) * t * ctrlLat + t * t * p2.lat;
    const lng = (1 - t) * (1 - t) * p1.lng + 2 * (1 - t) * t * ctrlLng + t * t * p2.lng;
    points.push([lat, lng]);
  }
  return { points, midPoint: [ctrlLat, ctrlLng] };
}

export default function IndiaRouteMap({
  origin = 'DEL',
  destination = 'BOM',
  onSelectAirport,
  showStats = true,
  distanceKm,
  avgFare,
  style = {}
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  const org = AIRPORT_COORDS[origin] || AIRPORT_COORDS.DEL;
  const dst = AIRPORT_COORDS[destination] || AIRPORT_COORDS.BOM;

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on India
    const map = L.map(mapContainerRef.current, {
      center: [21.8, 79.5],
      zoom: 4.6,
      minZoom: 4,
      maxZoom: 9,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false, // avoid accidental scrolling on page
    });

    // Elegant Dark Theme Tiles with English labels
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    // Fix leaflet map sizing after render
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update routes, markers, and flight paths dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Draw subtle background corridors
    MONITORED_ROUTES.forEach(([fCode, tCode]) => {
      const p1 = AIRPORT_COORDS[fCode];
      const p2 = AIRPORT_COORDS[tCode];
      if (!p1 || !p2) return;

      const isCurrent = (fCode === origin && tCode === destination) || (fCode === destination && tCode === origin);
      if (isCurrent) return; // rendered with active glow below

      const { points } = getFlightCurvePoints(p1, p2, 30, 0.12);
      L.polyline(points, {
        color: '#1890ff',
        weight: 1.5,
        opacity: 0.25,
        dashArray: '4, 8'
      }).addTo(layerGroup);
    });

    // 2. Draw active flight corridor
    if (org && dst && org.code !== dst.code) {
      const { points, midPoint } = getFlightCurvePoints(org, dst, 80, 0.16);

      // Glow shadow line
      L.polyline(points, {
        color: '#fa8c16',
        weight: 6,
        opacity: 0.35,
      }).addTo(layerGroup);

      // Main active flight line
      L.polyline(points, {
        color: '#d46b08',
        weight: 3.5,
        opacity: 0.95,
        dashArray: '8, 8',
        className: 'leaflet-active-flight-line'
      }).addTo(layerGroup);

      // Midpoint Airplane icon marker
      const planeIcon = L.divIcon({
        className: 'custom-plane-icon',
        html: `<div style="transform: rotate(45deg); font-size: 20px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));">✈️</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker(midPoint, { icon: planeIcon, interactive: false }).addTo(layerGroup);

      // Fit map to include both endpoints smoothly
      const bounds = L.latLngBounds([
        [org.lat, org.lng],
        [dst.lat, dst.lng]
      ]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 6, animate: true });
    }

    // 3. Draw Airport Nodes
    Object.entries(AIRPORT_COORDS).forEach(([code, ap]) => {
      const isOrigin = code === origin;
      const isDest = code === destination;
      const isEndpoint = isOrigin || isDest;
      const color = isOrigin ? '#fa8c16' : isDest ? '#52c41a' : '#1890ff';

      const iconHtml = `
        <div class="custom-airport-marker ${isEndpoint ? 'endpoint-active' : ''}">
          ${isEndpoint ? `<div class="marker-pulse-ring" style="border-color: ${color}"></div>` : ''}
          <div class="marker-dot" style="background: ${color}">
            <span>${code}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'airport-div-icon',
        html: iconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([ap.lat, ap.lng], { icon: customIcon }).addTo(layerGroup);

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; text-align: center; padding: 4px;">
          <strong style="color: ${color}; font-size: 14px;">${ap.city} (${ap.code})</strong><br/>
          <span style="color: #64748b; font-size: 11px;">${ap.name}</span><br/>
          <span style="display: inline-block; margin-top: 6px; font-weight: 600; color: #1890ff; cursor: pointer;">
            ✈️ Click to select this route
          </span>
        </div>
      `);

      marker.on('click', () => {
        if (onSelectAirport) onSelectAirport(code);
      });
    });

  }, [origin, destination, onSelectAirport]);

  return (
    <div className="real-india-map-card" style={style}>
      <div className="real-india-map-header">
        <div className="real-map-title">
          <span className="live-indicator">● LIVE</span>
          <span>Real Indian Airspace Flight Corridors</span>
        </div>
        <div className="real-map-badge">
          {org.city} ({org.code}) ➔ {dst.city} ({dst.code})
        </div>
      </div>

      <div className="real-map-wrapper">
        <div ref={mapContainerRef} className="leaflet-map-element" style={{ width: '100%', height: 380 }} />

        {/* Floating Route Info Box */}
        {showStats && (
          <div className="real-route-floating-stats">
            <div style={{ fontWeight: 800, color: '#002766', fontSize: 13 }}>
              ✈️ {org.city} ➔ {dst.city}
            </div>
            <div style={{ fontSize: 11, color: '#595959', marginTop: 2 }}>
              Flight Distance: <strong>{distanceKm ? `${distanceKm} km` : '1,148 km'}</strong>
            </div>
            {avgFare && (
              <div style={{ fontSize: 11, color: '#389e0d', fontWeight: 700, marginTop: 1 }}>
                Index Avg Fare: ₹{Math.round(avgFare).toLocaleString('en-IN')}
              </div>
            )}
            <div style={{ fontSize: 10, color: '#1890ff', marginTop: 3 }}>
              Direct Airway Corridors Active
            </div>
          </div>
        )}
      </div>

      <div className="real-map-footer">
        <div className="real-map-legend-item">
          <span className="legend-dot" style={{ background: '#fa8c16' }}></span>
          <span>Origin ({origin})</span>
        </div>
        <div className="real-map-legend-item">
          <span className="legend-dot" style={{ background: '#52c41a' }}></span>
          <span>Destination ({destination})</span>
        </div>
        <div className="real-map-legend-item">
          <span className="legend-dot" style={{ background: '#1890ff' }}></span>
          <span>Domestic Metros (Click to Route)</span>
        </div>
      </div>
    </div>
  );
}
