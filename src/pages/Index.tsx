import { motion } from "framer-motion";
import { Shield, ShieldAlert, MapPin, Timer, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { icon: ShieldAlert, title: "Instant SOS", desc: "One-tap emergency alert with live GPS location" },
  { icon: MapPin, title: "Live Tracking", desc: "Real-time map with your position and path history" },
  { icon: Timer, title: "Safety Timer", desc: "Auto-alert when your countdown expires" },
];

const Index = () => {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Shield className="h-9 w-9" />
            </div>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4 leading-tight">
            Your Safety,{" "}
            <span className="text-gradient">Always On</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            Shero is your personal emergency safety companion. Send SOS alerts, track your location, and keep your loved ones informed — all in one tap.
          </p>
          <Link to="/auth">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-display font-semibold text-lg hover:opacity-90 transition-opacity"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-4 pb-24">
        <div className="container mx-auto max-w-4xl grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="glass rounded-2xl p-6 text-center hover:scale-[1.02] transition-transform"
            >
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-primary/10 mb-4">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
