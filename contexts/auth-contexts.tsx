"use client";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";


interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) {

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const supabase = createClient();

    // Heartbeat to update last_active_at every 60 seconds
    useEffect(() => {
        if (!user?.id) return;

        const updateActivity = async () => {
            try {
                await supabase
                    .from("users")
                    .update({ last_active_at: new Date().toISOString() })
                    .eq("id", user.id);
            } catch (error) {
                console.error("Error updating activity:", error);
            }
        };

        // Update immediately
        updateActivity();

        // Then update every 60 seconds
        const interval = setInterval(updateActivity, 60000);

        return () => clearInterval(interval);
    }, [user?.id, supabase]);

    useEffect(() => {
        async function updateOnlineStatus(userId: string | undefined, isOnline: boolean) {
            if (!userId) return;
            
            try {
                await supabase
                    .from("users")
                    .update({ 
                        is_online: isOnline,
                        last_active_at: new Date().toISOString()
                    })
                    .eq("id", userId);
            } catch (error) {
                console.error("Error updating online status:", error);
            }
        }

        async function checkUser() {
            try {
                const {
                    data: {session},
                } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
                
                // Set user as online when session exists
                if (session?.user) {
                    await updateOnlineStatus(session.user.id, true);
                }

                // Any changes in the user's auth state
                const { data: {subscription}, } = supabase.auth.onAuthStateChange(async (event, session) => {
                    setUser(session?.user ?? null);
                    
                    // Update online status based on auth event
                    if (event === "SIGNED_IN" && session?.user) {
                        await updateOnlineStatus(session.user.id, true);
                    } else if (event === "SIGNED_OUT") {
                        // User is being set to null, so we don't have ID anymore
                        // This is handled in the signOut function
                    }
                }); 

                return () => {
                    subscription.unsubscribe();
                }

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        checkUser();
    }, [supabase]);

    // Function to handle sign out 
    async function signOut() {
        try {
            // Set user as offline before signing out
            if (user?.id) {
                await supabase
                    .from("users")
                    .update({ 
                        is_online: false,
                        last_active_at: new Date().toISOString()
                    })
                    .eq("id", user.id);
            }
            
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }

    return (
    <AuthContext.Provider value={{user, loading, signOut}}>
        {children}
    </AuthContext.Provider>
);
}

// call the use context hook to access the auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}