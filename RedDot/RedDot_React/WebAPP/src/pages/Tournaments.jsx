import React, { useState } from 'react';
import { updateMatchScore, advanceRound } from '../API/Tournament.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import TournamentManager from '../components/Tournament/TournamentManager.jsx';
import TournamentBracket from '../components/Tournament/TournamentBracket.jsx';
import { showScoreInputModal, showAdvanceRoundModal } from '../components/Tournament/ScoreInputModal.jsx';
import { useTournament } from '../hooks/useTournament.js';
import Swal from 'sweetalert2';
import '../styles/Tournaments.css';

const Tournaments = () => {
    const { user } = useAuth();
    const [activeView, setActiveView] = useState('tournaments');
    const [selectedTournament, setSelectedTournament] = useState(null);

    const { tournament, loading, error, refreshTournament } = useTournament(
        selectedTournament?.id,
        selectedTournament?.accessKey
    );

    const handleTournamentSelect = (tournament) => {
        console.log('🎯 Torneo seleccionado:', tournament);
        setSelectedTournament(tournament);
        setActiveView('bracket');
    };

    const handleMatchClick = async (matchData) => {
        if (!selectedTournament || !tournament?.esCreador) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin permisos',
                text: 'Solo el creador del torneo puede editar resultados'
            });
            return;
        }
        

        await showScoreInputModal(matchData, selectedTournament.id, async () => {
            await refreshTournament(),handlePutPlayers(matchData);
        });
    };

    const handlePutPlayers = (matchData) => {
        matchData.match.participantes.map((player, index) => {
            if(player.idJugador==null){
                return false;
            }

        
        })
        return true;
    };

    const handleAdvanceRound = async (round) => {
        if (!selectedTournament || !tournament?.esCreador) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin permisos',
                text: 'Solo el creador del torneo puede avanzar rondas'
            });
            return;
        }

        await showAdvanceRoundModal(round, async (confirmedRound) => {
            try {
                Swal.fire({
                    title: 'Avanzando ronda...',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });

                const result = await advanceRound({
                    idTorneo: selectedTournament.id,
                    rondaActual: confirmedRound
                });

                if (result.success) {
                    await refreshTournament();
                    Swal.fire({
                        icon: 'success',
                        title: '¡Ronda avanzada!',
                        text: confirmedRound === 'final' ?
                            '🏆 ¡Torneo finalizado!' :
                            `Avanzando a la siguiente ronda`,
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    throw new Error(result.error || 'Error al avanzar ronda');
                }
            } catch (error) {
                console.error('Error al avanzar ronda:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'No se pudo avanzar la ronda'
                });
            }
        });
    };

    if (activeView === 'bracket' && selectedTournament) {
        return (
            <div className="tournaments-page">
                <div className="tournaments-header">
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            setActiveView('tournaments');
                            setSelectedTournament(null);
                        }}
                    >
                        ← Volver a Torneos
                    </button>
                    <h1>🏆 {tournament?.nombre || 'Bracket del Torneo'}</h1>
                </div>

                {loading ? (
                    <LoadingSpinner message="Cargando torneo..." />
                ) : error ? (
                    <div className="error-container">
                        <h3>❌ Error al cargar el torneo</h3>
                        <p>{error}</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setActiveView('tournaments')}
                        >
                            Volver a Torneos
                        </button>
                    </div>
                ) : tournament ? (
                    <TournamentBracket
                        tournament={tournament}
                        onMatchClick={handleMatchClick}
                        onAdvanceRound={handleAdvanceRound}
                    />
                ) : (
                    <div className="error-container">
                        <h3>🔍 Torneo no encontrado</h3>
                        <button
                            className="btn btn-primary"
                            onClick={() => setActiveView('tournaments')}
                        >
                            Volver a Torneos
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="tournaments-page">
            <div className="tournaments-header">
                <h1>🏆 Torneos 🏆</h1>
                <div className="header-actions">
                    <p className="welcome-text">
                        Bienvenido, <strong>{user?.username}</strong>
                    </p>
                </div>
            </div>

            <TournamentManager onTournamentSelect={handleTournamentSelect} />
        </div>
    );
};

export default Tournaments;