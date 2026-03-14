import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SmartSOSButton from "./SmartSOSButton";

const FloatingSOS = () => {
  const location = useLocation();

  // Hide on Dashboard and SOS active pages where there's already a prominent SOS button
  if (location.pathname === "/dashboard" || location.pathname === "/sos") {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        className="fixed bottom-6 right-6 z-50 cursor-pointer"
        aria-label="SOS Emergency"
      >
        <SmartSOSButton size="sm" />
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingSOS;
