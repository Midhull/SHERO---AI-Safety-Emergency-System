import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { UserPlus, LogIn, LayoutDashboard, ShieldAlert, Settings, Info, ArrowLeft } from "lucide-react";

const steps = [
    { icon: UserPlus, title: "Register", desc: "Open the app and register by filling out your name, contact info, and emergency contact." },
    { icon: LogIn, title: "Log In", desc: "Once registered, log in with your credentials to access the main dashboard." },
    { icon: LayoutDashboard, title: "Familiarize", desc: "Familiarize yourself with the dashboard buttons: Emergency SOS for sending alerts and Contact for support." },
    { icon: ShieldAlert, title: "Send SOS", desc: "To send an SOS, tap the button; the app will capture your GPS location and notify responders." },
    { icon: Settings, title: "Settings", desc: "Use the Settings section to update your profile or change your emergency contact." },
    { icon: Info, title: "Learn More", desc: "Check the Learn More page for additional tips and app features." },
];

const HowToUse = () => {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                        How to Use the <span className="text-gradient">SHERO App</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Follow these simple steps to get started and ensure your safety is just a tap away.
                    </p>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-2 mb-12">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass rounded-2xl p-6 flex items-start gap-4 hover:scale-[1.02] transition-transform"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                <step.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-display font-semibold text-xl mb-2">{step.title}</h3>
                                <p className="text-muted-foreground">{step.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex justify-center"
                >
                    <Link to="/about">
                        <button className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Back to About
                        </button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default HowToUse;
