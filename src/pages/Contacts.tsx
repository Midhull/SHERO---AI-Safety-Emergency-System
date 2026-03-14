import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, AlertTriangle, Star, MessageCircle, Phone, Smartphone, Plus } from "lucide-react";

interface Contact {
    id: string;
    name: string;
    phone: string;
    priority: "High" | "Medium" | "Low";
}

const defaultContacts: Contact[] = [
    { id: "1", name: "Mom", phone: "+1 234 567 8901", priority: "High" },
    { id: "2", name: "Dad", phone: "+1 234 567 8902", priority: "High" },
    { id: "3", name: "Sarah (Sister)", phone: "+1 987 654 3210", priority: "Medium" }
];

const PriorityBadge = ({ priority }: { priority: string }) => {
    const colors = {
        High: "bg-red-500/20 text-red-500 border-red-500/30",
        Medium: "bg-amber-500/20 text-amber-500 border-amber-500/30",
        Low: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    };
    return (
        <span className={`text-xs px-2 py-1 rounded-md border ${(colors as any)[priority]}`}>
            {priority} Priority
        </span>
    );
};

const Contacts = () => {
    const [contacts, setContacts] = useState<Contact[]>(() => {
        const saved = localStorage.getItem("shero_contacts");
        return saved ? JSON.parse(saved) : defaultContacts;
    });
    const [notifying, setNotifying] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // New contact form state
    const [newName, setNewName] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [newPriority, setNewPriority] = useState<"High" | "Medium" | "Low">("Medium");

    const saveContacts = (newContacts: Contact[]) => {
        setContacts(newContacts);
        localStorage.setItem("shero_contacts", JSON.stringify(newContacts));
    };

    const handleAddContact = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newPhone) return;

        const newContact: Contact = {
            id: Date.now().toString(),
            name: newName,
            phone: newPhone,
            priority: newPriority,
        };

        saveContacts([...contacts, newContact]);
        setIsAdding(false);
        setNewName("");
        setNewPhone("");
        setNewPriority("Medium");
    };

    const handleDeleteContact = (id: string) => {
        const filtered = contacts.filter(c => c.id !== id);
        saveContacts(filtered);
    };

    const simulateNotify = (c: Contact) => {
        setNotifying(c.id);
        setTimeout(() => setNotifying(null), 2000);
    };

    return (
        <div className="min-h-screen pt-20 pb-24 px-4 flex flex-col items-center">
            <div className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="font-display text-3xl font-bold flex items-center gap-2"
                    >
                        <Users className="h-8 w-8 text-primary" />
                        Emergency Contacts
                    </motion.h1>
                    <motion.button
                        onClick={() => setIsAdding(!isAdding)}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition"
                    >
                        <Plus className={`h-4 w-4 transition-transform ${isAdding ? 'rotate-45' : ''}`} /> {isAdding ? 'Cancel' : 'Add'}
                    </motion.button>
                </div>

                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 overflow-hidden"
                        >
                            <form onSubmit={handleAddContact} className="glass p-5 rounded-2xl border border-primary/30 flex flex-col gap-4">
                                <h3 className="font-semibold text-primary">Add New Contact</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Name (e.g. John Doe)"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="bg-background/50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        required
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone (+1 234...)"
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value)}
                                        className="bg-background/50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        required
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <select
                                        value={newPriority}
                                        onChange={(e) => setNewPriority(e.target.value as "High" | "Medium" | "Low")}
                                        className="bg-background/50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="High">High Priority</option>
                                        <option value="Medium">Medium Priority</option>
                                        <option value="Low">Low Priority</option>
                                    </select>
                                    <button
                                        type="submit"
                                        className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition"
                                    >
                                        Save Contact
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-4">
                    <AnimatePresence>
                        {contacts.map((contact, i) => (
                            <motion.div
                                key={contact.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`glass p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${notifying === contact.id ? 'border-primary shadow-[0_0_15px_rgba(255,0,0,0.5)]' : 'border-border/50'} relative overflow-hidden`}
                            >
                                {/* Notify Animation Overlay */}
                                {notifying === contact.id && (
                                    <motion.div
                                        initial={{ x: "-100%", opacity: 0 }}
                                        animate={{ x: "100%", opacity: [0, 1, 0] }}
                                        transition={{ duration: 1.5, ease: "easeInOut" }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none"
                                    />
                                )}

                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                                        {contact.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            {contact.name}
                                            {contact.priority === "High" && <Star className="h-4 w-4 text-warning fill-warning" />}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">{contact.phone}</p>
                                        <div className="mt-1">
                                            <PriorityBadge priority={contact.priority} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => simulateNotify(contact)}
                                        className="p-3 bg-secondary rounded-xl hover:bg-green-500/20 hover:text-green-500 transition tooltip-container relative group"
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">Test WhatsApp</span>
                                    </button>
                                    <button
                                        onClick={() => simulateNotify(contact)}
                                        className="p-3 bg-secondary rounded-xl hover:bg-blue-500/20 hover:text-blue-500 transition tooltip-container relative group"
                                    >
                                        <Smartphone className="h-5 w-5" />
                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">Test SMS</span>
                                    </button>
                                    <button
                                        onClick={() => simulateNotify(contact)}
                                        className="p-3 bg-secondary rounded-xl hover:bg-primary/20 hover:text-primary transition tooltip-container relative group"
                                    >
                                        <Phone className="h-5 w-5" />
                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">Test Call</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteContact(contact.id)}
                                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition tooltip-container relative group ml-2"
                                    >
                                        <Plus className="h-5 w-5 rotate-45" />
                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">Delete</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="mt-8 glass p-5 rounded-2xl flex items-start gap-4 border border-safe/30">
                    <AlertTriangle className="h-6 w-6 text-safe mt-1" />
                    <div>
                        <h4 className="font-semibold text-sm">Automated Alerts Settings</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            When SOS is triggered, High Priority contacts receive an instant phone call and WhatsApp message. Medium/Low priorities receive standard SMS tracking links.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Contacts;
