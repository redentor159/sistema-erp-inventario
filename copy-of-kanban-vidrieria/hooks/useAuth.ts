import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { FirebaseUser } from '../types';

export const useAuth = () => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
            setUser(firebaseUser);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return { user, loading };
};
