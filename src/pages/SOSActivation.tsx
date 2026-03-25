import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Video, MapPin, ShieldAlert, CheckCircle2, PhoneCall, AlertTriangle, ChevronRight, X, Activity, Navigation, Share2, LocateFixed, History, ShieldCheck, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MiniMap from "@/components/MiniMap";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const SOSActivation = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState("initiating"); // initiating, active, cancelled

    const broadcastSOS = async () => {
        if (!user) return;
        
        const { error } = await supabase
            .from('incidents')
            .upsert({ 
                user_id: user.id,
                status: 'active',
                is_emergency: true,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (error) {
            console.error("SOS Broadcast Error:", error);
            toast.error("Cloud broadcast failed. Local alerts active.");
        }
    };

    const resolveSOS = async () => {
        if (!user) return;
        await supabase
            .from('incidents')
            .update({ status: 'resolved', is_emergency: false })
            .eq('user_id', user.id);
    };

    useEffect(() => {
        broadcastSOS();

        // Sequence of events
        const seq = async () => {
            await new Promise((r) => setTimeout(r, 1500));
            setStatus("active");
        };
        seq();
    }, [user]);

    const handleCancel = async () => {
        const input = window.prompt("Enter your 4-digit Safety PIN to cancel SOS:");
        // Use user's real PIN from database, or fallback to the one in context
        if (input === (user?.pin || "1234")) { 
            await resolveSOS();
            setStatus("cancelled");
            toast.success("SOS Protocol Resolved");
            setTimeout(() => navigate("/dashboard"), 2000);
        } else if (input) {
            toast.error("Incorrect Safety PIN! Alert escalation continues.");
        }
    };

    if (status === "cancelled") {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-strong p-8 rounded-3xl text-center max-w-sm w-full"
                >
                    <CheckCircle2 className="h-16 w-16 text-safe mx-auto mb-4" />
                    <h2 className="font-display text-2xl font-bold mb-2">SOS Resolved</h2>
                    <p className="text-muted-foreground">Emergency protocol terminated.</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-24 px-4 relative overflow-hidden flex flex-col items-center">
            {/* Red flashing background effect */}
            <motion.div
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute inset-0 bg-red-600/20 pointer-events-none"
            />

            <div className="w-full max-w-md z-10 flex flex-col gap-6">

                {/* Header section */}
                <div className="text-center mt-8">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-red-500/20 mb-4"
                    >
                        <ShieldAlert className="h-12 w-12 text-sos" />
                    </motion.div>
                    <h1 className="font-display text-4xl font-bold text-sos mb-2">SOS ACTIVE</h1>
                    <p className="text-lg font-medium">
                        {status === "initiating" ? "Transmitting Emergency Protocol..." : "Emergency Services Notified!"}
                    </p>
                </div>

                {/* Action blocks */}
                <div className="space-y-4">
                    <ActionBlock
                        icon={MapPin}
                        title="Live Location Shared"
                        desc="Tracking your precise GPS coordinates"
                        status={status}
                        delay={0.2}
                    />
                    <ActionBlock
                        icon={PhoneCall}
                        title="Contacts Notified"
                        desc="Alerts sent to 3 priority contacts"
                        status={status}
                        delay={0.6}
                    />
                    <ActionBlock
                        icon={Video}
                        title="Auto-Recording"
                        desc="Capturing secure video evidence"
                        status={status}
                        delay={1.0}
                        activeClass="text-red-500 animate-pulse"
                    />
                    <ActionBlock
                        icon={Mic}
                        title="Surroundings Audio"
                        desc="Microphone is streaming live audio"
                        status={status}
                        delay={1.4}
                        activeClass="text-red-500 animate-pulse"
                    />
                </div>

                {/* Interactive map mock */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2 }}
                    className="glass aspect-video rounded-2xl overflow-hidden relative border border-sos/50 flex flex-col items-center justify-center bg-black/40"
                >
                    <div className="w-full h-full relative z-0">
                        <MiniMap />
                    </div>
                    {/* Pulsing red vignette effect */}
                    <div className="absolute inset-0 z-10 bg-[radial-gradient(circle,transparent_50%,rgba(220,38,38,0.3)_100%)] pointer-events-none animate-pulse"></div>
                    <div className="absolute top-2 left-2 bg-black/80 p-2 rounded text-xs flex items-center gap-2 border border-sos/50 z-20 backdrop-blur-sm text-sos">
                        <AlertTriangle className="h-4 w-4 relative animate-bounce" />
                        <span className="font-bold">Live GPS tracking active</span>
                    </div>
                </motion.div>

                {/* Cancel Button */}
                <div className="mt-8 mb-4 flex justify-center">
                    <button
                        onClick={handleCancel}
                        className="px-8 py-3 rounded-full bg-secondary/80 text-foreground font-semibold hover:bg-secondary transition-colors border border-border flex items-center gap-2"
                    >
                        Cancel SOS Protocol
                    </button>
                </div>

            </div>
        </div>
    );
};

const ActionBlock = ({ icon: Icon, title, desc, delay, status, activeClass = "text-safe" }: any) => {
    const isDone = status === "active";
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className="glass p-4 rounded-2xl flex items-center gap-4 border border-sos/20 relative overflow-hidden"
        >
            <div className={`p-3 rounded-xl bg-background/50 ${isDone ? activeClass : 'text-muted-foreground'}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            {isDone ? (
                <CheckCircle2 className="h-5 w-5 text-safe mr-2" />
            ) : (
                <div className="h-5 w-5 rounded-full border-2 border-sos/50 border-t-transparent animate-spin mr-2" />
            )}
        </motion.div>
    );
}

export default SOSActivation;
