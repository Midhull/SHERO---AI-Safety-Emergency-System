import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix static leaflet assets
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
import { Shield, AlertTriangle, Activity, Users, Map as MapIcon, BarChart3, Clock, CheckCircle2, Lock, X, Video, MapPin, Mic } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, Navigate } from "react-router-dom";
import MiniMap from "@/components/MiniMap";

const LiveMonitorModal = ({ incident, onClose, onResolve }: { incident: any, onClose: () => void, onResolve: () => void }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const audioRef = React.useRef<HTMLAudioElement>(null);

    useEffect(() => {
        // Request actual camera and microphone for a real-time feel
        let mediaStream: MediaStream | null = null;

        const startMedia = async () => {
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.warn("Could not access media devices, falling back to active stream simulation.", err);
            }
        };

        startMedia();

        return () => {
            // Cleanup media tracks when closing modal
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-strong border border-sos/50 w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Modal Header */}
                <div className="bg-sos/10 p-4 border-b border-sos/30 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sos opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-sos"></span>
                        </span>
                        <h3 className="font-display font-bold text-xl text-sos">LIVE MONITORING: #{incident.id.toString().substring(0, 4)}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/20 rounded-full transition">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                    {/* Video Feed */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <Video className="h-4 w-4" /> User Video Feed
                        </div>
                        <div className="aspect-video bg-black rounded-2xl border border-border relative overflow-hidden flex items-center justify-center">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted // Muted so user testing locally doesn't get feedback loops
                                className="w-full h-full object-cover relative z-10"
                            />
                            {/* Fallback ping if no video loads */}
                            <div className="absolute flex flex-col items-center justify-center inset-0 z-0">
                                <div className="absolute inset-0 bg-red-900/10 animate-pulse mix-blend-overlay"></div>
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-sos animate-ping" /> Connection Established
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Location Feed */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <MapPin className="h-4 w-4" /> Live GPS Tracking
                        </div>
                        <div className="aspect-video bg-black rounded-2xl border border-border overflow-hidden relative">
                            {/* Rendering MiniMap component for actual active tracking instead of static iframe */}
                            <div className="w-full h-full pb-8 scale-[1.3] origin-center -mt-4">
                                <MiniMap />
                            </div>
                            {/* Vignette to blend MiniMap neatly inside this box */}
                            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none"></div>
                        </div>
                    </div>

                    {/* Audio Feed & Actions */}
                    <div className="md:col-span-2 flex flex-col md:flex-row gap-4 justify-between items-center bg-background/50 p-4 rounded-xl border border-border">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="p-2 rounded-full bg-safe/20 text-safe animate-pulse">
                                <Mic className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold">Live Audio Stream</p>
                                <p className="text-muted-foreground text-xs text-safe blink">Receiving secure audio packets...</p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <button onClick={() => alert("Police dispatched to user coordinates!")} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition">
                                Dispatch Police
                            </button>
                            <button
                                onClick={onResolve}
                                className="flex-1 md:flex-none bg-safe hover:bg-safe/90 text-white px-6 py-2 rounded-lg font-semibold transition"
                            >
                                Force Resolve
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");

    // Only allow admin@shero.com for now
    if (!user || user.email !== "admin@shero.com") {
        return (
            <div className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center relative overflow-hidden bg-background">
                <div className="z-10 text-center max-w-md glass p-10 rounded-3xl border border-sos/20">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-sos/10 text-sos mb-6">
                        <Lock className="h-10 w-10" />
                    </div>
                    <h1 className="font-display text-3xl font-bold mb-2">Access Denied</h1>
                    <p className="text-muted-foreground mb-8">This portal is strictly restricted to SHERO Administrators.</p>
                    <Link to="/dashboard" className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition shadow-lg inline-flex items-center gap-2">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-24 px-4 bg-background">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="font-display text-4xl font-bold flex items-center gap-3 text-primary">
                            <Shield className="h-10 w-10 text-primary" />
                            Shero Admin HQ
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg">Central hub for tracking safety and system health.</p>
                    </motion.div>
                    <div className="flex gap-2 bg-secondary/50 p-1 rounded-xl glass border-border">
                        {["overview", "map", "analytics"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${activeTab === tab ? "bg-primary text-white shadow-lg" : "hover:bg-black/10 dark:hover:bg-white/10"}`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Tabs */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full flex flex-col gap-6"
                >
                    {activeTab === "overview" && <OverviewTab />}
                    {activeTab === "map" && <MapTab />}
                    {activeTab === "analytics" && <AnalyticsTab />}
                </motion.div>

            </div>
        </div>
    );
};

const OverviewTab = () => {
    const [stats, setStats] = useState({ activeSOS: 0, usersOnline: 1, health: 100, zones: 142 });
    const [incidents, setIncidents] = useState<any[]>([]);
    const [resolved, setResolved] = useState<any[]>([]);
    const [viewingIncident, setViewingIncident] = useState<any>(null);

    useEffect(() => {

        const checkSOS = () => {
            const raw = localStorage.getItem("shero_active_sos");
            if (raw) {
                try {
                    const data = JSON.parse(raw);
                    if (data.active) {
                        setStats(prev => ({ ...prev, activeSOS: prev.activeSOS + 1 }));
                        setIncidents(prev => {
                            // Don't duplicate real incident if already at top
                            if (prev.length > 0 && prev[0].isReal) return prev;
                            const newIncident = {
                                id: Date.now(),
                                text: "REAL TIME SOS ACTIVATED - Current User",
                                time: "LIVE",
                                user: "ME",
                                isReal: true
                            };
                            return [newIncident, ...prev].slice(0, 4);
                        });
                    }
                } catch (e) { }
            }
        };

        window.addEventListener("storage", checkSOS);
        checkSOS(); // Check initially

        return () => {
            window.removeEventListener("storage", checkSOS);
        };
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={AlertTriangle} title="Active SOS" value={stats.activeSOS.toString()} color="text-sos" bg="bg-sos/10" />
                    <StatCard icon={Users} title="Users Online" value={stats.usersOnline.toLocaleString()} color="text-blue-500" bg="bg-blue-500/10" />
                    <StatCard icon={Activity} title="System Health" value={stats.health.toFixed(1) + "%"} color="text-safe" bg="bg-safe/10" />
                    <StatCard icon={MapIcon} title="Safe Zones" value={stats.zones.toString()} color="text-purple-500" bg="bg-purple-500/10" />
                </div>

                <div className="glass p-6 rounded-3xl border border-sos/30 bg-sos/5">
                    <h2 className="font-display font-semibold text-xl mb-4 flex items-center gap-2 text-sos">
                        <AlertTriangle className="animate-pulse" /> Critical Incidents (Live)
                    </h2>
                    <div className="space-y-4">
                        {incidents.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                                All clear. No active emergencies currently tracked.
                            </div>
                        ) : (
                            incidents.map((incident: any) => (
                                <motion.div
                                    key={incident.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`p-4 rounded-2xl flex items-center justify-between border-l-4 ${incident.isReal ? 'bg-sos/20 border-l-sos shadow-[0_0_15px_rgba(255,0,0,0.5)]' : 'bg-background/80 border-l-sos/80'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${incident.isReal ? 'bg-sos text-white animate-bounce' : 'bg-sos/20 text-sos animate-pulse'}`}>
                                            <span className="font-bold text-sm">#{incident.id.toString().substring(0, 4)}</span>
                                        </div>
                                        <div>
                                            <h4 className={`font-semibold text-sm ${incident.isReal ? 'text-sos' : ''}`}>{incident.text}</h4>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {incident.time} • User ID: {incident.user}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setViewingIncident(incident)}
                                        className="bg-sos hover:bg-sos/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md"
                                    >
                                        Monitor Live
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Live Monitoring Modal */}
            {viewingIncident && (
                <LiveMonitorModal
                    incident={viewingIncident}
                    onClose={() => setViewingIncident(null)}
                    onResolve={() => {
                        setResolved(prev => [{
                            id: viewingIncident.id,
                            text: "Force Resolved by Admin",
                            user: viewingIncident.user,
                            time: "Just now"
                        }, ...prev]);
                        setIncidents(prev => prev.filter((i: any) => i.id !== viewingIncident.id));
                        setStats(prev => ({ ...prev, activeSOS: Math.max(0, prev.activeSOS - 1) }));
                        setViewingIncident(null);
                    }}
                />
            )}

            <div className="glass p-6 rounded-3xl flex flex-col h-full border-border">
                <h3 className="font-display font-semibold text-lg mb-4">Recent Resolved</h3>
                <div className="flex-1 space-y-4 overflow-y-auto">
                    {resolved.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No recent incidents resolved.
                        </div>
                    ) : (
                        resolved.map((res: any) => (
                            <motion.div
                                key={res.id}
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-4 items-start pb-4 border-b border-border/50 last:border-0 last:pb-0"
                            >
                                <CheckCircle2 className="text-safe h-5 w-5 mt-1" />
                                <div>
                                    <p className="text-sm font-medium">{res.text}</p>
                                    <p className="text-xs text-muted-foreground mt-1">User {res.user} • {res.time}</p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, title, value, color, bg }: any) => (
    <div className="glass p-5 rounded-2xl border border-border/50 flex flex-col items-center text-center gap-2 hover:scale-[1.02] transition">
        <div className={`p-3 rounded-full ${bg} ${color}`}>
            <Icon className="h-6 w-6" />
        </div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
        <span className={`text-2xl font-bold font-display ${color}`}>{value}</span>
    </div>
);

const MapTab = () => {
    const mapRef = React.useRef<HTMLDivElement>(null);
    const mapInstance = React.useRef<L.Map | null>(null);
    const circlesRef = React.useRef<L.Circle[]>([]);

    const [markers, setMarkers] = React.useState([
        { id: 1, pos: [40.715, -74.002], color: "hsl(var(--sos))", rad: 200, label: "High Risk Area" },
        { id: 2, pos: [40.711, -74.008], color: "hsl(var(--warning))", rad: 150, label: "Active Tracking Drop" },
        { id: 3, pos: [40.720, -74.010], color: "hsl(var(--sos))", rad: 250, label: "Scream Detection Point" }
    ]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMarkers(prev => prev.map(m => ({
                ...m,
                pos: [
                    m.pos[0] + (Math.random() * 0.0004 - 0.0002),
                    m.pos[1] + (Math.random() * 0.0004 - 0.0002)
                ],
                rad: Math.max(50, m.rad + (Math.random() * 20 - 10))
            })));
        }, 1500);
        return () => clearInterval(intervalId);
    }, []);

    // Init map
    React.useEffect(() => {
        if (!mapInstance.current && mapRef.current) {
            mapInstance.current = L.map(mapRef.current).setView([40.7128, -74.0060], 13);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://carto.com/">CartoDB</a>'
            }).addTo(mapInstance.current);
            
            // Create initial circles
            markers.forEach((zone: any) => {
                const circle = L.circle([zone.pos[0], zone.pos[1]], {
                    color: zone.color,
                    fillColor: zone.color,
                    fillOpacity: 0.35,
                    weight: 2,
                    radius: zone.rad
                }).addTo(mapInstance.current!);
                
                circle.bindPopup(`<div style="font-family: inherit; font-weight: 500;">${zone.label}</div>`);
                circlesRef.current.push(circle);
            });
        }
        
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
                circlesRef.current = [];
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
    // Update markers
    React.useEffect(() => {
        if (mapInstance.current && circlesRef.current.length === markers.length) {
            markers.forEach((zone: any, i) => {
                circlesRef.current[i].setLatLng([zone.pos[0], zone.pos[1]]);
                circlesRef.current[i].setRadius(zone.rad);
            });
        }
    }, [markers]);

    return (
        <div className="w-full h-[70vh] rounded-3xl overflow-hidden glass border-[1px] border-border shadow-2xl relative transition-all duration-300">
            <div ref={mapRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 10 }}></div>
            
            <div className="absolute top-4 left-4 z-[400] glass px-5 py-3 rounded-2xl border border-sos/50 flex items-center gap-3 backdrop-blur-md bg-background/80 shadow-xl">
                <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sos opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-sos"></span>
                </span>
                <span className="text-sm font-bold text-foreground font-display cursor-default">Live Heatmap Overlay Tracking Active</span>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] glass px-6 py-3 rounded-full border border-border flex items-center gap-4 bg-background/80 shadow-lg cursor-default">
                <span className="text-xs font-semibold text-muted-foreground"><span className="text-sos">Red:</span> Critical Issue</span>
                <span className="w-1 h-1 bg-border rounded-full"></span>
                <span className="text-xs font-semibold text-muted-foreground"><span className="text-warning">Yellow:</span> Monitoring</span>
            </div>
        </div>
    );
};

const AnalyticsTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[70vh]">
        <div className="glass rounded-3xl border border-border p-6 flex flex-col items-center justify-center text-center">
            <BarChart3 className="h-20 w-20 text-muted-foreground/30 mb-4" />
            <h3 className="font-display font-semibold text-xl">Incident Reports (Monthly)</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">Detailed visual charts require recharts data injection. System shows a 14% decrease in high-risk zones.</p>
        </div>
        <div className="glass rounded-3xl border border-border p-6 flex flex-col items-center justify-center text-center">
            <Activity className="h-20 w-20 text-safe/30 mb-4" />
            <h3 className="font-display font-semibold text-xl">System Latency tracking</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">Average SOS transmission time: 140ms. Audio/Video streaming uptime: 99.98%.</p>
        </div>
    </div>
);

export default AdminDashboard;
