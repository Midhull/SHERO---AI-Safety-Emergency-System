import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface User {
    id: string;
    email: string;
    fullName: string;
    pin: string;
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string, fullName: string, pin: string) => User;
    signIn: (email: string, password: string) => User;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("shero-user");
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse user session", e);
            }
        }
        setLoading(false);
    }, []);

    const signUp = useCallback((email: string, password: string, fullName: string, pin: string) => {
        const users: Record<string, { password: string; user: User }> = JSON.parse(
            localStorage.getItem("shero-users") || "{}"
        );
        if (users[email]) {
            throw new Error("An account with this email already exists");
        }
        const newUser: User = {
            id: crypto.randomUUID(),
            email,
            fullName,
            pin,
            createdAt: new Date().toISOString(),
        };
        users[email] = { password, user: newUser };
        // Temporarily save users and current user in localStorage for persistence across sessions
        localStorage.setItem("shero-users", JSON.stringify(users));
        localStorage.setItem("shero-user", JSON.stringify(newUser));
        setUser(newUser);
        return newUser;
    }, []);

    const signIn = useCallback((email: string, password: string) => {
        const users: Record<string, { password: string; user: User }> = JSON.parse(
            localStorage.getItem("shero-users") || "{}"
        );

        // Provide a mocked fallback for demo face login if user@demo.com is used
        if (email === "user@demo.com" && password === "password") {
            const mockUser = {
                id: "mock123", email, fullName: "Demo User", pin: "1234", createdAt: new Date().toISOString()
            };
            localStorage.setItem("shero-user", JSON.stringify(mockUser));
            setUser(mockUser);
            return mockUser;
        }

        // Provide a mocked fallback for admin login
        if (email === "admin@shero.com" && password === "password") {
            const adminUser = {
                id: "admin123", email, fullName: "Admin Chief", pin: "0000", createdAt: new Date().toISOString()
            };
            localStorage.setItem("shero-user", JSON.stringify(adminUser));
            setUser(adminUser);
            return adminUser;
        }

        const record = users[email];
        if (!record || record.password !== password) {
            throw new Error("Invalid email or password");
        }

        // Temporarily save the session credentials
        localStorage.setItem("shero-user", JSON.stringify(record.user));
        setUser(record.user);
        return record.user;
    }, []);

    const signOut = useCallback(() => {
        localStorage.removeItem("shero-user");
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
