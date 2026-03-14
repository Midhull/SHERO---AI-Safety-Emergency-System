import { motion } from "framer-motion";
import { Shield, Home, LifeBuoy } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center">
            <div className="container mx-auto max-w-3xl text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-primary/5 blur-3xl shadow-2xl" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-primary/5 blur-3xl shadow-2xl" />

                    <div className="relative z-10">
                        <div className="flex justify-center mb-6">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                                <Shield className="h-8 w-8" />
                            </div>
                        </div>

                        <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                            About <span className="text-gradient">SHERO</span>
                        </h1>

                        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed mb-12">
                            <p>
                                SHERO is a safety application designed for quick help in emergencies. Our goal is to empower users by providing fast SOS alerts and easy access to support.
                            </p>
                            <p>
                                Download the mobile app to access features like live location sharing, neighborhood alerts, and more. Stay protected, stay connected.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-6 py-3 rounded-xl font-medium transition-colors w-full sm:w-auto justify-center"
                                >
                                    <Home className="h-4 w-4" />
                                    Back to Home
                                </motion.button>
                            </Link>

                            <Link to="/how-to-use">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 px-6 py-3 rounded-xl font-medium transition-all w-full sm:w-auto justify-center"
                                >
                                    <LifeBuoy className="h-4 w-4" />
                                    How to Use
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
