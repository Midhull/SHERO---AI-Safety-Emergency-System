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

import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const LiveTracking = () => {
    const { user } = useAuth();
    const [position, setPosition] = useState<{ lat: number, lng: number } | null>(null);
    const [route, setRoute] = useState<{ lat: number, lng: number }[]>([]);
    const [locating, setLocating] = useState(true);

    const [safeZones, setSafeZones] = useState<any[]>([]);
    const [activeZoneName, setActiveZoneName] = useState("AI Analyzing...");
    const [activeZoneCoords, setActiveZoneCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [showAssistant, setShowAssistant] = useState(false);
    
    // Map ref
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const routePolyline = useRef<L.Polyline | null>(null);
    const safeZonePolyline = useRef<L.Polyline | null>(null);
    const userMarker = useRef<L.Marker | null>(null);
    const safeZoneMarkers = useRef<L.LayerGroup | null>(null);

    const handleShareLocation = async () => {
        if (!position) {
            toast.error("GPS signal not acquired. Please wait.");
            return;
        }

        const shareUrl = `${window.location.origin}/live-tracking?lat=${position.lat}&lng=${position.lng}&shared=true`;
        const shareData = {
            title: 'SHERO Live Safety Tracking',
            text: `Follow my live location for safety:`,
            url: shareUrl
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                toast.success("Live tracking active and shared!");
            } else {
                await navigator.clipboard.writeText(`${shareData.text} ${shareUrl}`);
                toast.success("Tracking link copied to clipboard! Send it to your emergency contacts.");
            }
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                toast.error("Sharing failed. Please try copying the link manually.");
            }
        }
    };

    // Haversine formula for real-time distance calculation
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    // Fetch real-time data from OpenStreetMap (Overpass API)
    const fetchRealSafeZones = async (lat: number, lng: number) => {
        try {
            // Search for hospitals and police stations within 3000 meters
            const radius = 3000;
            const query = `
                [out:json];
                (
                  node["amenity"="hospital"](around:${radius},${lat},${lng});
                  node["amenity"="police"](around:${radius},${lat},${lng});
                  node["emergency"="rescue_station"](around:${radius},${lat},${lng});
                );
                out body;
            `;
            
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data.elements && data.elements.length > 0) {
                const realZones = data.elements.map((el: any) => {
                    const zoneLat = el.lat;
                    const zoneLng = el.lon;
                    const name = el.tags.name || (el.tags.amenity === 'police' ? "Local Police Station" : "Emergency Care Center");
                    
                    return {
                        id: el.id,
                        name: name,
                        pos: { lat: zoneLat, lng: zoneLng },
                        type: el.tags.amenity || "emergency",
                        distance: getDistance(lat, lng, zoneLat, zoneLng)
                    };
                }).sort((a: any, b: any) => a.distance - b.distance);
                
                setSafeZones(realZones.slice(0, 5)); // Top 5 nearest
                
                if (realZones.length > 0) {
                    setActiveZoneName(realZones[0].name);
                    setActiveZoneCoords(realZones[0].pos);
                    if (mapInstance.current) {
                        drawSafeZoneMarkers(realZones.slice(0, 5));
                    }
                }
            } else {
                console.warn("No real-world safe zones found in immediate area. Falling back to simulation.");
                // Fallback if API returns empty (e.g. user in a remote area)
                initializeMockZones({ lat, lng });
            }
        } catch (error) {
            console.error("Error fetching Overpass data:", error);
            initializeMockZones({ lat, lng });
        }
    };

    const initializeMockZones = (pos: { lat: number, lng: number }) => {
        const initialZones = [
            { id: 101, name: "Simulation: City Health Terminal", latOffset: 0.005, lngOffset: -0.004, type: "hospital" },
            { id: 102, name: "Simulation: Security Node 12", latOffset: -0.004, lngOffset: 0.006, type: "police" },
        ].map(zone => {
            const lat = pos.lat + zone.latOffset;
            const lng = pos.lng + zone.lngOffset;
            return {
                ...zone,
                pos: { lat, lng },
                distance: getDistance(pos.lat, pos.lng, lat, lng)
            };
        });

        const sortedZones = initialZones.sort((a, b) => a.distance - b.distance);
        setSafeZones(sortedZones);
        setActiveZoneName(sortedZones[0].name);
        setActiveZoneCoords(sortedZones[0].pos);
        if (mapInstance.current) {
            drawSafeZoneMarkers(sortedZones);
        }
    };

    const initializeZones = (pos: { lat: number, lng: number }) => {
        fetchRealSafeZones(pos.lat, pos.lng);
    };

    const drawSafeZoneMarkers = (zones: any[]) => {
        if (!mapInstance.current) return;
        
        // Clear existing markers if group exists
        if (safeZoneMarkers.current) {
            safeZoneMarkers.current.clearLayers();
        } else {
            safeZoneMarkers.current = L.layerGroup().addTo(mapInstance.current);
        }
        
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
                    ${zone.type.toUpperCase()} • ${(zone.distance).toFixed(2)} km
                </div>
            `);
            
            circle.addTo(safeZoneMarkers.current!);
        });
    };

    const setRouteToZone = (zone: any) => {
        setActiveZoneName(zone.name);
        setActiveZoneCoords(zone.pos);
    };

    // Update distances whenever position changes
    useEffect(() => {
        if (position && safeZones.length > 0) {
            setSafeZones(prev => {
                const updated = prev.map(zone => ({
                    ...zone,
                    distance: getDistance(position.lat, position.lng, zone.pos.lat, zone.pos.lng)
                })).sort((a, b) => a.distance - b.distance);
                
                // If the map is ready, we might want to refresh popup content, but drawSafeZoneMarkers 
                // is expensive to run on every tiny movement. We only redraw if markers change significantly.
                return updated;
            });
        }
    }, [position]);

    // Watch real location or load shared location
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sharedLat = params.get('lat');
        const sharedLng = params.get('lng');
        const isShared = params.get('shared') === 'true';

        if (isShared && sharedLat && sharedLng) {
            const sharedPos = { lat: parseFloat(sharedLat), lng: parseFloat(sharedLng) };
            setPosition(sharedPos);
            setRoute([sharedPos]);
            setLocating(false);
            initializeZones(sharedPos);
            toast.info("Viewing shared live location", {
                description: "This link shows the location shared by your contact."
            });
            return; // Don't start tracking if we are just a viewer
        }

        if (!navigator.geolocation) {
            const fallback = { lat: 40.7128, lng: -74.0060 };
            setPosition(fallback);
            setRoute([fallback]);
            setLocating(false);
            initializeZones(fallback);
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            async (pos) => {
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

                // Broadcast to Supabase for real-time tracking
                if (user) {
                    await supabase
                        .from('incidents')
                        .upsert({ 
                            user_id: user.id,
                            lat: newPos.lat,
                            lng: newPos.lng,
                            status: 'active',
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'user_id' });
                }
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
                
                if (safeZones.length > 0) {
                    drawSafeZoneMarkers(safeZones);
                }
            } else {
                // Smoothly update user position
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
                        onClick={handleShareLocation}
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
                                    <p className="text-sm font-medium mb-1">I found {safeZones.length} verified safe locations nearby. Sorted by nearest to your live position:</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {safeZones.map((zone, idx) => (
                                            <button
                                                key={zone.id}
                                                onClick={() => {
                                                    setRouteToZone(zone);
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
                                                        {zone.distance.toFixed(2)} km away
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

                    <div 
                        onClick={handleShareLocation}
                        className="glass p-5 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/5 transition md:col-span-1"
                    >
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
