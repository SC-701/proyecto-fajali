import { useState, useEffect } from 'react';
import { getEliminationTournament } from '../API/TournamentElimination.js';


export const useTournament = (tournamentId, accessKey = null) => {
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refreshTournament = async () => {
        if (!tournamentId) return;

        setLoading(true);
        try {
            const result = await getEliminationTournament(tournamentId, accessKey);
            if (result.success) {
                setTournament(result.data);
                setError(null);
            } else {
                setError(result.error || 'Error al cargar el torneo');
            }
        } catch (err) {
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