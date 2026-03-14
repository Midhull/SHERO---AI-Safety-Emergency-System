import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ShieldCheck, Activity } from "lucide-react";

// Fix static leaflet assets
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MiniMap = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const [position, setPosition] = useState<{ lat: number, lng: number } | null>(null);
    const [locating, setLocating] = useState(true);

    // Watch real location
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocating(false);
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setPosition({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
                setLocating(false);
            },
            (err) => {
                console.error("Error getting location:", err);
                // Fallback location
                setPosition({ lat: 40.7128, lng: -74.0060 });
                setLocating(false);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    useEffect(() => {
        if (position && mapRef.current && !mapInstance.current) {
            // Initialize map
            mapInstance.current = L.map(mapRef.current).setView([position.lat, position.lng], 14);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://carto.com/">CartoDB</a>'
            }).addTo(mapInstance.current);

            // Add marker
            const markerHtml = `
                <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
                    <div style="position: absolute; width: 32px; height: 32px; background-color: hsl(var(--primary) / 0.3); border-radius: 50%; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                    <div style="width: 16px; height: 16px; background-color: hsl(var(--primary)); border-radius: 50%; border: 3px solid white; z-index: 10; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>
                </div>
            `;
            const customIcon = L.divIcon({
                html: markerHtml,
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            });

            L.marker([position.lat, position.lng], { icon: customIcon }).addTo(mapInstance.current);
        } else if (position && mapInstance.current) {
            mapInstance.current.setView([position.lat, position.lng]);
        }
        
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [position]);

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden relative bg-background border border-border">
            {locating && !position ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-20">
                    <Activity className="h-10 w-10 text-primary mb-4 animate-pulse" />
                    <span className="text-sm font-medium text-muted-foreground animate-pulse">Obtaining GPS Signal...</span>
                </div>
            ) : null}
            
            <div ref={mapRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 10 }}></div>
            
            {position && (
                <div className="absolute bottom-4 left-4 z-20">
                    <div className="glass px-3 py-1.5 rounded-full border border-safe/20 flex items-center gap-2 bg-background/80 shadow-lg">
                        <ShieldCheck className="h-4 w-4 text-safe" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-safe">Location Secure</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MiniMap;
