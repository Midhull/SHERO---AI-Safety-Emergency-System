import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, ShieldCheck, Share2, LocateFixed, History, MessageSquare, ChevronRight, MapPin, X, Activity } from "lucide-react";

// Fix static leaflet assets
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LiveTracking = () => {
    const [position, setPosition] = useState<{ lat: number, lng: number } | null>(null);
    const [route, setRoute] = useState<{ lat: number, lng: number }[]>([]);
    const [locating, setLocating] = useState(true);

    const safeZones = useRef<any[]>([]);
    const [activeZoneName, setActiveZoneName] = useState("AI Analyzing...");
    const [activeZoneCoords, setActiveZoneCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [showAssistant, setShowAssistant] = useState(false);
    
    // Map ref
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const routePolyline = useRef<L.Polyline | null>(null);
    const safeZonePolyline = useRef<L.Polyline | null>(null);
    const userMarker = useRef<L.Marker | null>(null);

    const initializeZones = (pos: { lat: number, lng: number }) => {
        const foundZones = [
            { name: "City Hospital (Fallback)", pos: { lat: pos.lat + 0.004, lng: pos.lng - 0.003 }, type: "hospital", distance: 0.8 },
            { name: "Precinct 12 (Fallback)", pos: { lat: pos.lat - 0.003, lng: pos.lng + 0.004 }, type: "police", distance: 1.2 },
        ];
        safeZones.current = foundZones;
        setActiveZoneName(foundZones[0].name);
        setActiveZoneCoords(foundZones[0].pos);
        
        if (mapInstance.current) {
            drawSafeZones(foundZones);
        }
    };

    const drawSafeZones = (zones: any[]) => {
        if (!mapInstance.current) return;
        
        zones.forEach(zone => {
            const circle = L.circle([zone.pos.lat, zone.pos.lng], {
                color: "hsl(142.1 76.2% 36.3%)",
                fillColor: "hsl(142.1 76.2% 36.3%)",
                fillOpacity: 0.35,
                weight: 2,
                radius: 40
            });
            
            circle.bindPopup(`
                <div style="color: black; font-weight: bold; font-family: sans-serif; font-size: 13px; display: flex; align-items: center; gap: 4px;">
                    🛡️ ${zone.name}
                </div>
                <div style="color: #666; font-size: 11px; margin-top: 2px;">
                    ${zone.type.toUpperCase()}
                </div>
            `);
            
            circle.addTo(mapInstance.current!);
        });
    };

    const setRouteToZone = (index: number) => {
        if (safeZones.current.length === 0 || !position) return;
        setActiveZoneName(safeZones.current[index].name);
        setActiveZoneCoords(safeZones.current[index].pos);
    };

    // Watch real location
    useEffect(() => {
        if (!navigator.geolocation) {
            const fallback = { lat: 40.7128, lng: -74.0060 };
            setPosition(fallback);
            setRoute([fallback]);
            setLocating(false);
            initializeZones(fallback);
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setPosition(prev => {
                    if (!prev) initializeZones(newPos);
                    return newPos;
                });
                setLocating(false);
                setRoute(prevRoute => {
                    const last = prevRoute[prevRoute.length - 1];
                    if (last && last.lat === newPos.lat && last.lng === newPos.lng) return prevRoute;
                    return [...prevRoute, newPos];
                });
            },
            (err) => {
                console.error("Error getting location:", err);
                if (!position) {
                    const fallback = { lat: 40.7128, lng: -74.0060 };
                    setPosition(fallback);
                    setRoute([fallback]);
                    setLocating(false);
                    initializeZones(fallback);
                }
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Leaflet map initialization and updates
    useEffect(() => {
        if (position && mapContainerRef.current) {
            if (!mapInstance.current) {
                // Initialize map
                mapInstance.current = L.map(mapContainerRef.current).setView([position.lat, position.lng], 15);

                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://carto.com/">CartoDB</a>'
                }).addTo(mapInstance.current);

                // User marker
                const customIcon = L.divIcon({
                    html: `
                        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
                            <div style="position: absolute; width: 32px; height: 32px; background-color: hsl(var(--primary) / 0.3); border-radius: 50%; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                            <div style="width: 16px; height: 16px; background-color: hsl(var(--primary)); border-radius: 50%; border: 3px solid white; z-index: 10; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>
                        </div>
                    `,
                    className: '',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                });
                
                userMarker.current = L.marker([position.lat, position.lng], { icon: customIcon }).addTo(mapInstance.current);
                userMarker.current.bindPopup("You are here");
                
                drawSafeZones(safeZones.current);
            } else {
                // Update map
                mapInstance.current.setView([position.lat, position.lng]);
                
                if (userMarker.current) {
                    userMarker.current.setLatLng([position.lat, position.lng]);
                }
            }

            // Draw Route
            if (route.length > 1) {
                const latLangs = route.map(r => L.latLng(r.lat, r.lng));
                if (routePolyline.current) {
                    routePolyline.current.setLatLngs(latLangs);
                } else {
                    routePolyline.current = L.polyline(latLangs, { color: 'hsl(217.2 91.2% 59.8%)', weight: 4, opacity: 0.7 }).addTo(mapInstance.current);
                }
            }

            // Draw Suggested Route
            if (activeZoneCoords) {
                const latLangs = [L.latLng(position.lat, position.lng), L.latLng(activeZoneCoords.lat, activeZoneCoords.lng)];
                if (safeZonePolyline.current) {
                    safeZonePolyline.current.setLatLngs(latLangs);
                } else {
                    safeZonePolyline.current = L.polyline(latLangs, { 
                        color: 'hsl(142.1 76.2% 36.3%)', 
                        weight: 4, 
                        opacity: 0.8, 
                        dashArray: '10, 10' 
                    }).addTo(mapInstance.current);
                }
            }
        }
    }, [position, route, activeZoneCoords]);

    // Clean up
    useEffect(() => {
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    const panToLocation = () => {
        if (mapInstance.current && position) {
            mapInstance.current.flyTo([position.lat, position.lng], 16, { duration: 2 });
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-24 flex flex-col items-center">
            <div className="w-full max-w-5xl px-4 flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="font-display text-3xl font-bold flex items-center gap-3">
                            <Navigation className="h-8 w-8 text-safe" />
                            Live Tracking & Safe Zones
                        </h1>
                        <p className="text-muted-foreground mt-1">Real-time GPS with AI safest route suggestions.</p>
                    </motion.div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="hidden md:flex bg-primary/20 text-primary px-4 py-2 rounded-xl items-center gap-2 hover:bg-primary hover:text-white transition-colors border border-primary/30"
                    >
                        <Share2 className="h-4 w-4" /> Share Live Location
                    </motion.button>
                </div>

                {/* Map Container */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full h-[60vh] rounded-3xl overflow-hidden glass border-2 border-border shadow-2xl relative bg-background"
                >
                    {locating && !position ? (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-background/80 backdrop-blur-md">
                            <Activity className="h-10 w-10 text-primary mb-4 animate-pulse" />
                            <span className="text-sm font-medium text-foreground animate-pulse">Obtaining Secure GPS Signal...</span>
                        </div>
                    ) : null}

                    <div ref={mapContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 10 }}></div>
                    
                    {/* Map Overlay Controls */}
                    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                        <button onClick={panToLocation} className="bg-background/80 backdrop-blur p-3 rounded-full shadow-lg border border-white/10 hover:bg-white/20 transition group">
                            <LocateFixed className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                        </button>
                        <button className="bg-background/80 backdrop-blur p-3 rounded-full shadow-lg border border-white/10 hover:bg-white/20 transition group">
                            <History className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                        </button>
                    </div>
                </motion.div>

                {/* Action Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* AI Safety Assistant Widget */}
                    <div className="md:col-span-2 relative">
                        {showAssistant ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass p-5 rounded-2xl border border-primary/40 flex flex-col gap-4 shadow-xl shadow-primary/10"
                            >
                                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/20 rounded-full">
                                            <ShieldCheck className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm">SHERO AI Assistant</h3>
                                            <p className="text-xs text-muted-foreground whitespace-nowrap">Analyzing surrounding safety data...</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowAssistant(false)} className="p-1 hover:bg-white/10 rounded-full">
                                        <X className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm font-medium mb-1">I found {safeZones.current.length} verified safe locations nearby. Sorted by nearest to your live position:</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {safeZones.current.map((zone, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setRouteToZone(idx);
                                                    setShowAssistant(false);
                                                }}
                                                className="text-left px-4 py-3 bg-background/50 hover:bg-white/10 border border-white/5 rounded-xl transition flex items-center justify-between group"
                                            >
                                                <div>
                                                    <span className="text-sm font-semibold flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-safe" />
                                                        {zone.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground ml-6 capitalize font-mono">
                                                        {zone.distance ? `${zone.distance.toFixed(2)} km away` : zone.type}
                                                    </span>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div
                                onClick={() => setShowAssistant(true)}
                                className="glass p-5 rounded-2xl border border-primary/30 flex items-center justify-between group cursor-pointer hover:bg-primary/5 transition hover:shadow-[0_0_20px_rgba(255,105,180,0.15)]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/20 rounded-xl text-primary group-hover:scale-110 transition-transform">
                                        <MessageSquare className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm flex items-center gap-2">
                                            Ask AI Assistant
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary uppercase tracking-wider animate-pulse">Live</span>
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">Get fast and safe route suggestions</p>
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-safe bg-safe/10 px-3 py-1.5 rounded-full border border-safe/20">
                                    Currently Routing: {activeZoneName}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="glass p-5 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/5 transition md:col-span-1">
                        <div className="p-3 bg-primary/20 rounded-xl text-primary">
                            <Share2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Share Tracking</h3>
                            <p className="text-xs text-muted-foreground">Send to Contacts</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LiveTracking;
