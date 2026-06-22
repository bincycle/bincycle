"use client";

/**
 * LeafletMap.tsx
 *
 * Extracted into its own file so the parent can lazy-load it via
 *   dynamic(() => import("./LeafletMap"), { ssr: false })
 *
 * Leaflet requires browser globals (window / document), so SSR must be
 * disabled for this module. Keeping it separate is the clean Next.js pattern.
 */

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ---------------------------------------------------------------------------
// Custom pin icon (avoids the default-icon broken-asset issue)
// ---------------------------------------------------------------------------

const pinIcon = new L.DivIcon({
  className: "bincycle-map-pin",
  html: `<div style="
      width: 36px;
      height: 36px;
      transform: translate(-50%, -100%);
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));
  ">
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13z" fill="#C45B38" stroke="#171A15" stroke-width="1.5"/>
      <circle cx="12" cy="9" r="2.5" fill="#F7F5F0"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

// ---------------------------------------------------------------------------
// Internal map controllers
// ---------------------------------------------------------------------------

interface RecenterControllerProps {
  target: [number, number] | null;
}

const RecenterController = ({ target }: RecenterControllerProps) => {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, Math.max(map.getZoom(), 15), { duration: 0.6 });
    }
  }, [target, map]);
  return null;
};

interface ClickListenerProps {
  onPick: (pos: [number, number]) => void;
}

const ClickListener = ({ onPick }: ClickListenerProps) => {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

// Component to handle Leaflet container dimension invalidation inside dynamic/animating modal dialogs
const InvalidateSizeController = () => {
  const map = useMap();
  useEffect(() => {
    // Invalidate size immediately
    map.invalidateSize();
    // Schedule size invalidations at various stages of modal opening transitions
    const timers = [100, 300, 600, 1000].map((delay) =>
      setTimeout(() => {
        map.invalidateSize();
      }, delay)
    );
    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [map]);
  return null;
};

// ---------------------------------------------------------------------------
// Exported map component
// ---------------------------------------------------------------------------

interface LeafletMapProps {
  initialCenter: [number, number];
  pos: [number, number];
  recenterTarget: [number, number] | null;
  onMarkerMove: (pos: [number, number]) => void;
}

const LeafletMap = ({
  initialCenter,
  pos,
  recenterTarget,
  onMarkerMove,
}: LeafletMapProps) => {
  return (
    <MapContainer
      center={initialCenter}
      zoom={14}
      scrollWheelZoom
      style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <InvalidateSizeController />
      <RecenterController target={recenterTarget} />
      <ClickListener onPick={onMarkerMove} />
      <Marker
        position={pos}
        icon={pinIcon}
        draggable
        eventHandlers={{
          dragend(e) {
            const ll = e.target.getLatLng();
            onMarkerMove([ll.lat, ll.lng]);
          },
        }}
      />
    </MapContainer>
  );
};

export default LeafletMap;
