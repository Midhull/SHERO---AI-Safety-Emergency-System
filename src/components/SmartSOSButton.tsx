import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SmartSOSButtonProps {
    size?: "sm" | "lg";
    className?: string;
}

const SmartSOSButton: React.FC<SmartSOSButtonProps> = ({ size = "lg", className = "" }) => {
    const navigate = useNavigate();
    const [isPressing, setIsPressing] = useState(false);

    const handleActivate = () => {
        // Navigate to the SOS active screen where tracking, recording, etc. starts
        navigate("/sos");
    };

    const isLarge = size === "lg";
    const buttonSize = isLarge ? "h-48 w-48" : "h-20 w-20";
    const iconSize = isLarge ? "h-16 w-16" : "h-8 w-8";

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Ripple Backgrounds */}
            <motion.div
                animate={{ scale: [1, 1.2, 1.5, 1], opacity: [0.5, 0.3, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute rounded-full bg-sos/30 ${buttonSize}`}
            />
            <motion.div
                animate={{ scale: [1, 1.4, 1.8, 1], opacity: [0.3, 0.1, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className={`absolute rounded-full bg-sos/20 ${buttonSize}`}
            />

            {/* 3D Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9, y: 5 }}
                onMouseDown={() => setIsPressing(true)}
                onMouseUp={() => setIsPressing(false)}
                onMouseLeave={() => setIsPressing(false)}
                onClick={handleActivate}
                style={{
                    boxShadow: isPressing
                        ? "inset 0px 10px 20px rgba(0,0,0,0.5), 0px 2px 5px rgba(255, 0, 0, 0.6)"
                        : "inset 0px -10px 20px rgba(0,0,0,0.3), inset 0px 5px 15px rgba(255,255,255,0.4), 0px 15px 30px rgba(255, 0, 0, 0.5), 0px 0px 40px rgba(255, 0, 0, 0.6)",
                }}
                className={`relative z-10 flex flex-col items-center justify-center rounded-full bg-gradient-to-b from-sos to-red-700 text-sos-foreground ${buttonSize} border border-red-500/50`}
            >
                <ShieldAlert className={`${iconSize} drop-shadow-lg mb-1`} />
                {isLarge && (
                    <>
                        <span className="font-display text-2xl font-bold tracking-wider drop-shadow-md">SOS</span>
                        <span className="text-xs font-medium opacity-90 drop-shadow-md mt-1">HOLD OR TAP</span>
                    </>
                )}
            </motion.button>
        </div>
    );
};

export default SmartSOSButton;
