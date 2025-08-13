import { useState } from 'react';
import { changeTournamentStatus, getTournament } from '../API/Tournament.js';
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
    const [activeModal, setActiveModal] = useState(false);
    const [modal, setModal] = useState(null);

    const { loading, error } = useTournament(
        selectedTournament?.id,
        selectedTournament?.accessKey
    );

    const handleTournamentSelect = (tournament) => {
        console.log('🎯 Torneo seleccionado:', tournament);
        setSelectedTournament(tournament);
        setActiveView('bracket');


    };

    const handleAllActivePartipantes = (tournament) => {
        var allActiveParticipants = 0;
        tournament.participantes.forEach(participant => {
            if (participant.isSet) {
                allActiveParticipants++;
            }
        });
        return allActiveParticipants == 8;
    };

    const handleScoreUpdate = async () => {
        closeModal();

        var result = await getTournament(selectedTournament.id, selectedTournament.accessKey);
        if (!result.success) {
            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar torneo',
                text: result.error || 'No se pudo obtener el torneo actualizado'
            });
            return;
        }

        handleTournamentSelect(result.data);

    };

    const handleUpdate = async () => {

        var result = await getTournament(selectedTournament.id, selectedTournament.accessKey);
        if (!result.success) {
            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar torneo',
                text: result.error || 'No se pudo obtener el torneo actualizado'
            });
            return;
        }

        handleTournamentSelect(result.data);

    };

    const closeModal = () => {
        setActiveModal(false);

    };

    const handleMatchClick = (matchData) => {
        if (!matchData) {
            console.error('handleMatchClick: matchData is null or undefined');
            return;
        }

        if (!selectedTournament || !selectedTournament?.esCreador) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin permisos',
                text: 'Solo el creador del torneo puede editar resultados'
            });
            return;
        }

        const hasPlayers = handlePutPlayers(matchData);

        const ActivePlayers = handleAllActivePartipantes(selectedTournament);

        setModal({
            matchData,
            tournamentId: selectedTournament.id,
            isPlayersSet: hasPlayers,
            onScoreUpdated: handleScoreUpdate,
            onClose: closeModal,
            activePlayers: ActivePlayers
        }
        );

        setActiveModal(true);

    };

    const handlePutPlayers = (matchData) => {
        if (!matchData || !matchData.match || !matchData.match.participantes) {
            console.error('handlePutPlayers: Datos de match inválidos', matchData);
            return false;
        }

        const hasNullPlayer = matchData.match.participantes.some(player =>
            !player || player.idJugador == null || player.idJugador === undefined
        );
        return !hasNullPlayer;
    };

    const handleAdvanceRound = async (round) => {
        if (!selectedTournament || !selectedTournament?.esCreador) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin permisos',
                text: 'Solo el creador del torneo puede avanzar rondas'
            });
            return;
        }

        try {
            const result = await changeTournamentStatus(selectedTournament.id, selectedTournament.estado);
            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Ronda avanzada',
                    text: `Se ha avanzado a la ronda de ${round}`
                });
                await handleUpdate();
            } else {
                throw new Error(result.error || 'Error al avanzar la ronda');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al avanzar ronda',
                text: error.message
            });
        }

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
                            setActiveModal(null);
                            setModalProps(null);
                        }}
                    >
                        ← Volver a Torneos
                    </button>
                    <h1>🏆 {selectedTournament?.nombre || 'Bracket del Torneo'}</h1>
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
                ) : selectedTournament ? (
                    <>
                        <TournamentBracket
                            tournament={selectedTournament}
                            onMatchClick={handleMatchClick}
                            onAdvanceRound={handleAdvanceRound}
                            onActivePlayers={handleAllActivePartipantes}
                        />

                        {activeModal == true && modal && (
                            showScoreInputModal({
                                matchData: modal.matchData,
                                tournamentId: modal.tournamentId,
                                isPlayersSet: modal.isPlayersSet,
                                onScoreUpdated: modal.onScoreUpdated,
                                OnCloseFuntion: modal.onClose,
                                activePlayers: modal.activePlayers
                            })
                        )}


                    </>
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
                <p className="page-subtitle">
                    Bienvenido, {user?.username} en esta sección puedes participar y crear tus torneos.
                </p>
            </div>

            <TournamentManager onTournamentSelect={handleTournamentSelect} />
        </div>
    );
};

export default Tournaments;