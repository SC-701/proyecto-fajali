import React, { useState, useEffect } from 'react';
import { getParticipatingTournaments, getSportName, getStateName } from '../API/Tournament.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import TournamentCard from '../components/Tournament/TournamentCard.jsx';
import '../styles/Tournaments.css';

const Participando = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('participando');
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadTournaments();
    }, [activeTab]);

    const loadTournaments = async () => {
        setLoading(true);
        setError(null);
        try {
            let result;
            if (activeTab === 'participando') {
                // Torneos en curso: estados 0 (Por Iniciar) y 1 (En Progreso)
                const porIniciarResult = await getParticipatingTournaments(0);
                const enProgresoResult = await getParticipatingTournaments(1);

                const porIniciar = porIniciarResult.success ? (porIniciarResult.data || []) : [];
                const enProgreso = enProgresoResult.success ? (enProgresoResult.data || []) : [];

                setTournaments([...porIniciar, ...enProgreso].sort((a, b) =>
                    new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
                ));
            } else {
                // Historial: estados 2 (Terminado) y 3 (Cancelado)
                const terminadoResult = await getParticipatingTournaments(2);
                const canceladoResult = await getParticipatingTournaments(3);

                const terminado = terminadoResult.success ? (terminadoResult.data || []) : [];
                const cancelado = canceladoResult.success ? (canceladoResult.data || []) : [];

                setTournaments([...terminado, ...cancelado].sort((a, b) =>
                    new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
                ));
            }
        } catch (error) {
            console.error("Error loading tournaments:", error);
            setError("Error al cargar los torneos");
            setTournaments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTournamentSelect = (tournament) => {
        // Navegar al torneo seleccionado usando la lógica existente
        // Esto puede requerir integración con el componente padre o navegación
        console.log('Torneo seleccionado:', tournament);
    };

    const getEmptyMessage = () => {
        return activeTab === 'participando'
            ? "Aún no estás participando en ningún torneo."
            : "No hay historial de torneos.";
    };

    return (
        <div className="tournaments-page">
            <div className="tournaments-header">
                <h1>🏆 Participando 🏆</h1>
                <div className="header-actions">
                    <p className="welcome-text">
                        Bienvenido, <strong>{user?.username}</strong>
                    </p>
                </div>
            </div>

            <div className="tournament-manager">
                <div className="tournament-controls">
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'participando' ? 'active' : ''}`}
                            onClick={() => setActiveTab('participando')}
                        >
                            Participando
                        </button>
                        <button
                            className={`tab ${activeTab === 'historial' ? 'active' : ''}`}
                            onClick={() => setActiveTab('historial')}
                        >
                            Historial
                        </button>
                    </div>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <div className="error-container">
                        <h3>❌ Error</h3>
                        <p>{error}</p>
                        <button
                            className="btn btn-primary"
                            onClick={loadTournaments}
                        >
                            Reintentar
                        </button>
                    </div>
                ) : tournaments.length === 0 ? (
                    <div className="no-tournaments">
                        <p>{getEmptyMessage()}</p>
                    </div>
                ) : (
                    <div className="tournaments-grid">
                        {tournaments.map(tournament => (
                            <TournamentCard
                                key={tournament.id}
                                tournament={tournament}
                                onSelect={handleTournamentSelect}
                                showJoinButton={false} // No mostrar botón de unirse en participando
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Participando;