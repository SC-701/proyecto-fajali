import { useState, useEffect } from 'react';
import { getTournament } from '../API/Tournament.js';

export const useTournament = (tournamentId, accessKey = null) => {
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refreshTournament = async () => {
        if (!tournamentId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let result;


            if (accessKey === null) {
                result = await getTournament(tournamentId);
            } else {
                result = await getTournament(tournamentId, accessKey);
            }

            if (result.success) {
                setTournament(result.data);
                setError(null);
            } else {
                setTournament(null);
                setError(result.error || 'Error al cargar el torneo');
            }
        } catch (err) {
            setTournament(null);
            setError(err.message || 'Error inesperado');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshTournament();
    }, [tournamentId, accessKey]);

    return {
        tournament,
        loading,
        error,
        refreshTournament
    };
};