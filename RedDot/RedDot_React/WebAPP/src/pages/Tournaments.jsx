import React, { useState, useCallback } from 'react';
import { updateMatchScore, advanceRound } from '../API/Tournament.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import TournamentManager from '../components/Tournament/TournamentManager.jsx';
import TournamentBracket from '../components/Tournament/TournamentBracket.jsx';
import { showScoreInputModal } from '../components/Tournament/ScoreInputModal.jsx';
import { useTournament } from '../hooks/useTournament.js';
import Swal from 'sweetalert2';
import '../styles/Tournaments.css';

const Tournaments = () => {
    const { user } = useAuth();
    const [activeView, setActiveView] = useState('tournaments');
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [modalState, setModalState] = useState({
        isActive: false,
        data: null
    });

    const { loading, error, refreshTournament } = useTournament(
        selectedTournament?.id,
        selectedTournament?.accessKey
    );

    const validateCreatorPermission = useCallback(() => {
        if (!selectedTournament?.esCreador) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin permisos',
                text: 'Solo el creador del torneo puede realizar esta acción'
            });
            return false;
        }
        return true;
    }, [selectedTournament?.esCreador]);

    const validateMatchPlayers = useCallback((matchData) => {
        if (!matchData?.match?.participantes) {
            console.error('validateMatchPlayers: Datos de match inválidos', matchData);
            return false;
        }

        return !matchData.match.participantes.some(player =>
            !player || player.idJugador == null || player.idJugador === undefined
        );
    }, []);

    const openScoreModal = useCallback((matchData) => {
        if (!matchData) {
            console.error('openScoreModal: matchData is required');
            return;
        }

        const hasValidPlayers = validateMatchPlayers(matchData);

        setModalState({
            isActive: true,
            data: {
                matchData,
                tournamentId: selectedTournament.id,
                isPlayersSet: hasValidPlayers,
                onScoreUpdated: async () => {
                    setModalState({ isActive: false, data: null });
                    await refreshTournament();
                },
                onClose: () => setModalState({ isActive: false, data: null })
            }
        });
    }, [selectedTournament?.id, validateMatchPlayers, refreshTournament]);

    const handleTournamentSelect = useCallback((tournament) => {
        console.log('🎯 Torneo seleccionado:', tournament);
        setSelectedTournament(tournament);
        setActiveView('bracket');
        setModalState({ isActive: false, data: null });
    }, []);

    const handleMatchClick = useCallback((matchData) => {
        if (!validateCreatorPermission()) return;
        openScoreModal(matchData);
    }, [validateCreatorPermission, openScoreModal]);

    const handleAdvanceRound = useCallback(async (round) => {
        if (!validateCreatorPermission()) return;
        console.log('Advancing round:', round);
    }, [validateCreatorPermission]);

    const handleBackToTournaments = useCallback(() => {
        setActiveView('tournaments');
        setSelectedTournament(null);
        setModalState({ isActive: false, data: null });
    }, []);

    const renderTournamentHeader = () => (
        <div className="tournament-compact-header">
            <div className="tournament-header-row">
                <button
                    className="back-btn-compact"
                    onClick={handleBackToTournaments}
                >
                    ← Volver a Torneos
                </button>
                <div className="tournament-title-section">
                    <h1 className="tournament-main-title">
                        {selectedTournament?.nombre || 'Torneo'}
                    </h1>
                </div>
            </div>
            <div className="tournament-meta-compact">
                <span className="tournament-sport-compact">{selectedTournament?.tipoDeporte}</span>
                <span className={`tournament-status-compact status-${selectedTournament?.estado}`}>
                    {selectedTournament?.estado === 0 && 'POR INICIAR'}
                    {selectedTournament?.estado === 1 && 'EN PROGRESO'}
                    {selectedTournament?.estado === 2 && 'TERMINADO'}
                    {selectedTournament?.estado === 3 && 'CANCELADO'}
                </span>
            </div>
        </div>
    );

    const renderError = (message, showBackButton = true) => (
        <div className="error-container">
            <h3>❌ {message}</h3>
            {error && <p>{error}</p>}
            {showBackButton && (
                <button
                    className="btn btn-primary"
                    onClick={handleBackToTournaments}
                >
                    Volver a Torneos
                </button>
            )}
        </div>
    );

    const renderTournamentBracket = () => {
        if (loading) {
            return <LoadingSpinner message="Cargando torneo..." />;
        }

        if (error) {
            return renderError('Error al cargar el torneo');
        }

        if (!selectedTournament) {
            return renderError('Torneo no encontrado');
        }

        return (
            <>
                <TournamentBracket
                    tournament={selectedTournament}
                    onMatchClick={handleMatchClick}
                    onAdvanceRound={handleAdvanceRound}
                />

                {modalState.isActive && modalState.data && (
                    showScoreInputModal(modalState.data)
                )}
            </>
        );
    };

    const renderTournamentsList = () => (
        <div className="tournaments-header">
            <h1>Torneos 🏆</h1>
            <p className="page-subtitle">
                Explora, crea y únete a torneos. Gestiona tus competencias y descubre nuevos desafíos.
            </p>
        </div>
    );

    const isBracketView = activeView === 'bracket' && selectedTournament;

    return (
        <div className="tournaments-page">
            {isBracketView ? (
                <>
                    {renderTournamentHeader()}
                    {renderTournamentBracket()}
                </>
            ) : (
                <>
                    {renderTournamentsList()}
                    <TournamentManager onTournamentSelect={handleTournamentSelect} />
                </>
            )}
        </div>
    );
};

export default Tournaments;