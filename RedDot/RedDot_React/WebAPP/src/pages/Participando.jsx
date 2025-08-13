import { useState, useEffect } from 'react';
import { getParticipatingTournaments, getSportName, getStateName } from '../API/Tournament.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import TournamentCard from '../components/Tournament/TournamentCard.jsx';
import TournamentBracket from '../components/Tournament/TournamentBracket.jsx';
import { useTournament } from '../hooks/useTournament.js';
import '../styles/Tournaments.css';

const Participando = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('participando');
    const [activeView, setActiveView] = useState('tournaments');
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { loading: tournamentLoading, error: tournamentError, refreshTournament } = useTournament(
        selectedTournament?.id,
        selectedTournament?.accessKey
    );

    useEffect(() => {
        loadTournaments();
    }, [activeTab]);

    const loadTournaments = async () => {
        setLoading(true);
        setError(null);
        try {
            if (activeTab === 'participando') {
                // Obtener torneos activos (estados 0-3)
                const results = await Promise.all([
                    getParticipatingTournaments(0), // Por iniciar
                    getParticipatingTournaments(1), // Cuartos
                    getParticipatingTournaments(2), // Semis  
                    getParticipatingTournaments(3)  // Final
                ]);

                const allTournaments = [];
                results.forEach(result => {
                    if (result.success && result.data) {
                        allTournaments.push(...result.data);
                    }
                });

                setTournaments(allTournaments.sort((a, b) =>
                    new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
                ));
            } else {
                // Obtener torneos completados (estado 4)
                const completedResult = await getParticipatingTournaments(4);
                const completed = completedResult.success ? (completedResult.data || []) : [];

                setTournaments(completed.sort((a, b) =>
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
        console.log('🎯 Torneo seleccionado:', tournament);
        setSelectedTournament(tournament);
        setActiveView('bracket');
    };

    const handleBackToTournaments = () => {
        setActiveView('tournaments');
        setSelectedTournament(null);
    };

    const getEmptyMessage = () => {
        return activeTab === 'participando'
            ? "Aún no estás participando en ningún torneo activo."
            : "No hay historial de torneos completados.";
    };

    if (activeView === 'bracket' && selectedTournament) {
        return (
            <div className="tournaments-page">
                <div className="tournaments-header">
                    <button
                        className="btn btn-secondary"
                        onClick={handleBackToTournaments}
                    >
                        ← Volver a Participando
                    </button>
                    <h1>🏆 {selectedTournament?.nombre || 'Torneo'}</h1>
                    <p className="page-subtitle">
                        {activeTab === 'participando' ? 'Torneo en el que participas' : 'Historial de participación'}
                    </p>
                </div>

                {tournamentLoading ? (
                    <LoadingSpinner message="Cargando torneo..." />
                ) : tournamentError ? (
                    <div className="error-container">
                        <h3>❌ Error al cargar el torneo</h3>
                        <p>{tournamentError}</p>
                        <button
                            className="btn btn-primary"
                            onClick={handleBackToTournaments}
                        >
                            Volver a Participando
                        </button>
                    </div>
                ) : selectedTournament ? (
                    <TournamentBracket
                        tournament={selectedTournament}
                        onMatchClick={() => { }}
                        onAdvanceRound={() => { }}
                    />
                ) : (
                    <div className="error-container">
                        <h3>🔍 Torneo no encontrado</h3>
                        <button
                            className="btn btn-primary"
                            onClick={handleBackToTournaments}
                        >
                            Volver a Participando
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="tournaments-page">
            <div className="tournaments-header">
                <h1>Participando 🙋🏻</h1>
                <p className="page-subtitle">
                    <strong>{user?.username}</strong> Revisa los torneos en los que participas actualmente y consulta tu historial de competencias.
                </p>
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
                                user={user}
                                isParticipating={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Participando;