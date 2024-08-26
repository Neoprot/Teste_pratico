import { useState, useContext, createContext, useEffect } from 'react';
import { api } from '../services/api';

interface FavoritesContextValue {
    addFavorite: (movieId: number) => Promise<void>;
    removeFavorite: (movieId: number) => Promise<void>;
    isLoggedIn: boolean;
    userId: string;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};

export const FavoriteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userId, setUserId] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Simulando a autenticação do usuário. Em uma aplicação real, isso viria do login.
        const fakeUserId = '12345';
        setUserId(fakeUserId);
        setIsLoggedIn(true);
    }, []);

    const addFavorite = async (movieId: number) => {
        if (isLoggedIn) {
        await api.post('/movies/favorites', { movieId, userId });
        }
    };

    const removeFavorite = async (movieId: number) => {
        if (isLoggedIn) {
        await api.delete('/movies/favorites', { data: { movieId, userId } });
        }
    };

    return (
        <FavoritesContext.Provider value={{ addFavorite, removeFavorite, isLoggedIn, userId }}>
        {children}
        </FavoritesContext.Provider>
    );
};
