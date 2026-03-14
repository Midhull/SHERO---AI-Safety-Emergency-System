import { motion } from "framer-motion";
import { ShieldAlert, Users, Timer, MapPin, History, Shield } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SmartSOSButton from "@/components/SmartSOSButton";
import MiniMap from "@/components/MiniMap";

const quickCards = [
  { icon: Users, label: "Emergency Contacts", to: "/contacts", color: "text-accent" },
  { icon: Timer, label: "Safety Timer", to: "/timer", color: "text-warning" },
  { icon: MapPin, label: "Live Map", to: "/map", color: "text-safe" },
  { icon: History, label: "Alert History", to: "/history", color: "text-muted-foreground" },
];

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen pt-24 pb-24 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-display text-3xl font-bold mb-1">
            Hi, {user.fullName.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground">Your safety dashboard</p>
        </motion.div>

        {/* Smart 3D SOS Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex justify-center mb-12"
        >
          <SmartSOSButton size="lg" />
        </motion.div>

        {/* Quick cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickCards.map((card, i) => (
            <motion.div
              key={card.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <Link
                to={card.to}
                className="glass rounded-2xl p-5 flex flex-col items-center gap-3 hover:scale-[1.02] transition-transform group"
              >
                <card.icon className={`h-7 w-7 ${card.color} group-hover:scale-110 transition-transform`} />
                <span className="text-sm font-medium text-center">{card.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Live Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 glass rounded-2xl p-6 flex flex-col gap-4 h-[300px]"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-safe" />
              Live Location Tracking
            </h2>
            <Link to="/map" className="text-sm text-primary hover:underline">
              Expand
            </Link>
          </div>
          <div className="flex-1 w-full rounded-xl overflow-hidden border border-border">
            <MiniMap />
          </div>
        </motion.div>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 glass rounded-2xl p-6 flex items-center gap-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-safe/10">
            <Shield className="h-6 w-6 text-safe" />
          </div>
          <div>
            <p className="font-semibold">All Clear</p>
            <p className="text-sm text-muted-foreground">No active alerts. Stay safe!</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
