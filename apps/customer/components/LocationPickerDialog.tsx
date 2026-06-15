"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Crosshair, Search, Loader2, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NominatimAddress {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state_district?: string;
  postcode?: string;
}

interface NominatimResult {
  place_id: number | string;
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
}

interface LocationPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: { lat?: number; lng?: number };
  onConfirm: (location: {
    lat: number;
    lng: number;
    displayName: string;
    line1: string;
    city: string;
    pincode: string;
  }) => void;
}

// ---------------------------------------------------------------------------
// Lazy-loaded map — SSR must be disabled because Leaflet uses window/document
// ---------------------------------------------------------------------------

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#F7F5F0] text-xs text-[#596155]">
      Loading map…
    </div>
  ),
});

// ---------------------------------------------------------------------------
// Nominatim helpers
// ---------------------------------------------------------------------------

const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<NominatimResult | null> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    return (await res.json()) as NominatimResult;
  } catch {
    return null;
  }
};

const forwardGeocode = async (query: string): Promise<NominatimResult[]> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return [];
    return ((await res.json()) as NominatimResult[]) ?? [];
  } catch {
    return [];
  }
};

// ---------------------------------------------------------------------------
// Address extractor
// ---------------------------------------------------------------------------

const extractAddress = (
  raw: NominatimResult | null
): { line1: string; city: string; pincode: string } => {
  if (!raw) return { line1: "", city: "", pincode: "" };
  const a = raw.address ?? {};
  const line1 = [
    a.house_number,
    a.road ?? a.pedestrian ?? a.neighbourhood,
    a.suburb,
  ]
    .filter(Boolean)
    .join(", ");
  const city =
    a.city ?? a.town ?? a.village ?? a.county ?? a.state_district ?? "";
  const pincode = a.postcode ?? "";
  return { line1, city, pincode };
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946]; // Bengaluru

export const LocationPickerDialog = ({
  open,
  onOpenChange,
  initial,
  onConfirm,
}: LocationPickerDialogProps) => {
  const initialCenter = useMemo<[number, number]>(
    () =>
      initial?.lat && initial?.lng
        ? [initial.lat, initial.lng]
        : DEFAULT_CENTER,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initial?.lat, initial?.lng]
  );

  const [pos, setPos] = useState<[number, number]>(initialCenter);
  const [recenterTarget, setRecenterTarget] = useState<[number, number] | null>(
    null
  );
  const [details, setDetails] = useState<NominatimResult | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [locating, setLocating] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-init on each open
  useEffect(() => {
    if (open) {
      setPos(initialCenter);
      setRecenterTarget(initialCenter);
      setDetails(null);
      setResults([]);
      setSearch("");
      handleReverseGeocode(initialCenter[0], initialCenter[1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleReverseGeocode = async (lat: number, lng: number) => {
    setLoadingDetails(true);
    const data = await reverseGeocode(lat, lng);
    setLoadingDetails(false);
    if (data) setDetails(data);
  };

  const onMarkerMove = (next: [number, number]) => {
    setPos(next);
    handleReverseGeocode(next[0], next[1]);
  };

  const useCurrent = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation isn't available in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (loc) => {
        const next: [number, number] = [
          loc.coords.latitude,
          loc.coords.longitude,
        ];
        setPos(next);
        setRecenterTarget(next);
        handleReverseGeocode(next[0], next[1]);
        setLocating(false);
        toast.success("Locked onto your location.");
      },
      (err) => {
        setLocating(false);
        console.warn("[geo] error", err);
        if (err.code === 1)
          toast.error("Location permission denied. Enable it in browser settings.");
        else if (err.code === 2)
          toast.error("Couldn't get a fix. Try again outside.");
        else if (err.code === 3) toast.error("Location request timed out.");
        else toast.error("Couldn't get your location.");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Debounced search
  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!search.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const r = await forwardGeocode(search.trim());
      setSearching(false);
      setResults(r);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, open]);

  const pickResult = (r: NominatimResult) => {
    const next: [number, number] = [parseFloat(r.lat), parseFloat(r.lon)];
    setPos(next);
    setRecenterTarget(next);
    setResults([]);
    setSearch(r.display_name?.split(",")[0] ?? "");
    setDetails(r);
  };

  const confirm = () => {
    const { line1, city, pincode } = extractAddress(details);
    onConfirm({
      lat: Number(pos[0].toFixed(6)),
      lng: Number(pos[1].toFixed(6)),
      displayName: details?.display_name ?? `${pos[0]}, ${pos[1]}`,
      line1,
      city,
      pincode,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="location-picker-dialog"
        className="rounded-sm border-[#D1CDBC] bg-[#F7F5F0] w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-3xl p-0 overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col gap-0"
      >
        <DialogHeader className="p-4 sm:p-5 pb-2 sm:pb-3 border-b border-[#D1CDBC] text-left space-y-1.5">
          <p className="font-mono-label text-[10px] sm:text-xs text-[#596155]">
            [ pinpoint location ]
          </p>
          <DialogTitle className="font-display text-lg sm:text-xl font-black tracking-tight text-[#121710]">
            Pin your exact spot
          </DialogTitle>
          <DialogDescription className="hidden sm:block text-[#596155]">
            Drag the marker or click the map to set the pickup point. We'll
            auto-fill the address fields.
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 sm:p-4 border-b border-[#D1CDBC] space-y-2 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={useCurrent}
              disabled={locating}
              data-testid="map-use-current-location"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#284226] px-3 py-2 text-xs font-medium text-[#F7F5F0] hover:bg-[#1C2E1A] disabled:opacity-60 shrink-0"
            >
              {locating ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Crosshair size={12} />
              )}
              Use current location
            </button>
            <div className="relative flex-1">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#596155]"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search a place, road or pincode"
                data-testid="map-search-input"
                className="h-9 pl-8 text-xs rounded-sm border-[#D1CDBC] bg-white focus-visible:ring-[#284226]"
              />
              {searching && (
                <Loader2
                  size={12}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#596155] animate-spin"
                />
              )}
            </div>
          </div>
          {results.length > 0 && (
            <ul
              data-testid="map-search-results"
              className="rounded-sm border border-[#D1CDBC] bg-white max-h-32 sm:max-h-40 overflow-y-auto"
            >
              {results.map((r) => (
                <li key={r.place_id}>
                  <button
                    type="button"
                    onClick={() => pickResult(r)}
                    data-testid={`map-search-result-${r.place_id}`}
                    className="block w-full text-left px-3 py-2 text-xs text-[#121710] hover:bg-[#F7F5F0]"
                  >
                    {r.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Map — loaded dynamically with ssr: false */}
        <div
          data-testid="map-canvas-wrap"
          className="h-56 sm:h-72 lg:h-80 flex-1 min-h-[14rem] relative"
        >
          <LeafletMap
            initialCenter={initialCenter}
            pos={pos}
            recenterTarget={recenterTarget}
            onMarkerMove={onMarkerMove}
          />
        </div>

        <div className="p-3 sm:p-4 border-t border-[#D1CDBC] bg-white shrink-0">
          <p className="font-mono-label text-[10px] text-[#596155] mb-1">
            Selected
          </p>
          <p
            data-testid="map-selected-display"
            className="text-xs sm:text-sm text-[#121710] line-clamp-2"
          >
            {loadingDetails ? (
              <span className="text-[#596155]">Looking up address...</span>
            ) : (
              details?.display_name ??
              `Lat ${pos[0].toFixed(5)}, Lng ${pos[1].toFixed(5)}`
            )}
          </p>
          <p className="mt-0.5 font-mono-label text-[10px] text-[#596155]">
            <span data-testid="map-selected-coords">
              {pos[0].toFixed(6)}, {pos[1].toFixed(6)}
            </span>
          </p>
        </div>

        <div className="flex gap-2 p-3 sm:p-4 bg-[#F7F5F0] border-t border-[#D1CDBC] shrink-0">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            data-testid="map-cancel"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-sm border border-[#121710] px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-[#121710] hover:bg-[#121710] hover:text-[#F7F5F0] transition-colors"
          >
            <X size={14} /> Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            data-testid="map-confirm"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-sm bg-[#284226] px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-[#F7F5F0] hover:bg-[#1C2E1A] transition-colors"
          >
            <Check size={14} /> Use this location
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPickerDialog;
