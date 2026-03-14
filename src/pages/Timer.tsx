import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Timer as TimerIcon, Play, Square, Pause, ShieldAlert, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Timer = () => {
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [durationMinutes, setDurationMinutes] = useState(15);
    const navigate = useNavigate();

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && !isPaused && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            // Trigger SOS
            toast.error("Safety Timer expired! Triggering SOS...", {
                icon: <ShieldAlert className="text-sos" />,
                style: { backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.5)" }
            });
            setTimeout(() => {
                navigate("/sos");
            }, 1500);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, isPaused, timeLeft, navigate]);

    const handleStart = () => {
        if (timeLeft === 0 && !isActive) {
            setTimeLeft(durationMinutes * 60);
        }
        setIsActive(true);
        setIsPaused(false);
        toast.success("Safety timer started.");
    };

    const handlePause = () => {
        setIsPaused(!isPaused);
    };

    const handleStop = () => {
        setIsActive(false);
        setIsPaused(false);
        setTimeLeft(0);
        toast("Safety timer stopped.");
    };

    // Format time
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div className="min-h-screen pt-24 pb-24 px-4 flex flex-col items-center">
            <div className="w-full max-w-md">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
                    <h1 className="font-display text-3xl font-bold flex items-center justify-center gap-3">
                        <TimerIcon className="h-8 w-8 text-warning" />
                        Safety Timer
                    </h1>
                    <p className="text-muted-foreground mt-2">Set a timer for your journey. If it expires, SOS is triggered.</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-8 border border-warning/20 shadow-xl relative overflow-hidden flex flex-col items-center">
                    {/* Pulsing background when active */}
                    {isActive && !isPaused && (
                        <div className="absolute inset-0 bg-warning/5 animate-pulse rounded-3xl pointer-events-none" />
                    )}

                    {isActive ? (
                        <>
                            <div className="text-7xl font-mono font-bold tracking-tighter my-8 text-foreground drop-shadow-md z-10">
                                {formatTime(timeLeft)}
                            </div>
                            <div className="flex gap-4 w-full mt-4 z-10">
                                <button
                                    onClick={handlePause}
                                    className="flex-1 bg-secondary/80 hover:bg-secondary py-4 rounded-2xl flex items-center justify-center gap-2 font-medium transition-colors border border-border"
                                >
                                    {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                                    {isPaused ? "Resume" : "Pause"}
                                </button>
                                <button
                                    onClick={handleStop}
                                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-4 rounded-2xl flex items-center justify-center gap-2 font-medium transition-colors border border-red-500/20"
                                >
                                    <Square className="h-5 w-5" />
                                    Stop
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="my-8 flex items-center gap-6 z-10">
                                <button
                                    onClick={() => setDurationMinutes(Math.max(1, durationMinutes - 1))}
                                    className="p-4 rounded-full bg-secondary/50 hover:bg-secondary transition active:scale-95"
                                >
                                    <Minus className="h-6 w-6" />
                                </button>
                                <div className="text-5xl font-mono font-bold w-24 text-center">
                                    {durationMinutes} <span className="text-sm text-muted-foreground block -mt-1 uppercase tracking-widest font-sans font-normal">min</span>
                                </div>
                                <button
                                    onClick={() => setDurationMinutes(Math.min(120, durationMinutes + 1))}
                                    className="p-4 rounded-full bg-secondary/50 hover:bg-secondary transition active:scale-95"
                                >
                                    <Plus className="h-6 w-6" />
                                </button>
                            </div>

                            <button
                                onClick={handleStart}
                                className="w-full mt-4 bg-warning/20 hover:bg-warning/30 text-warning py-4 rounded-2xl flex items-center justify-center gap-3 font-semibold text-lg transition-all border border-warning/30 hover:scale-[1.02] z-10 shadow-[0_0_20px_rgba(234,179,8,0.1)]"
                            >
                                <Play className="fill-current h-6 w-6" /> Start Safety Timer
                            </button>
                        </>
                    )}
                </motion.div>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    <p>When the timer expires without being stopped, your emergency contacts will be notified automatically with your last known location.</p>
                </div>
            </div>
        </div>
    );
};

export default Timer;
