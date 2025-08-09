import React, { useState } from 'react';
import { updateMatchScore, advanceRound } from '../API/Tournament.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import TournamentManager from '../components/Tournament/TournamentManager.jsx';
import TournamentBracket from '../components/Tournament/TournamentBracket.jsx';
import {showScoreInputModal}  from '../components/Tournament/ScoreInputModal.jsx';
import { useTournament } from '../hooks/useTournament.js';
import Swal from 'sweetalert2';
import '../styles/Tournaments.css';

const Tournaments = () => {
    const { user } = useAuth();
    const [activeView, setActiveView] = useState('tournaments');
    const [selectedTournament, setSelectedTournament] = useState(null);
    
    // Estados para el modal - INICIALIZADOS CORRECTAMENTE
    const [activeModal, setActiveModal] = useState(false);
    const [modal,setModal]= useState(null);

    const { loading, error, refreshTournament } = useTournament(
        selectedTournament?.id,
        selectedTournament?.accessKey
    );

    const handleTournamentSelect = (tournament) => {
        console.log('🎯 Torneo seleccionado:', tournament);
        setSelectedTournament(tournament);
        setActiveView('bracket');
        // Limpiar modal al cambiar de torneo
       
        
    };

    const handleMatchClick = (matchData) => {
        // Validación básica de datos
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

        // Verificar si los jugadores están establecidos
        const hasPlayers = handlePutPlayers(matchData);

        // Función para cerrar el modal
        const closeModal = () => {
            setActiveModal(false);
           
        };

        // Función callback para cuando se actualiza el score
        const handleScoreUpdate = async () => {
            closeModal();
            await refreshTournament();
        };

      
        
        
        
        
        setModal({
            matchData,
            tournamentId: selectedTournament.id,
            isPlayersSet: hasPlayers,
            onScoreUpdated: handleScoreUpdate,
            onClose: closeModal}
        );

        
        setActiveModal(true);
        

       

           
    };

    const handlePutPlayers = (matchData) => {
        // Validar que matchData y sus propiedades existan
        if (!matchData || !matchData.match || !matchData.match.participantes) {
            console.error('handlePutPlayers: Datos de match inválidos', matchData);
            return false; // Asumir que no hay jugadores si hay datos inválidos
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
        
        // Aquí puedes agregar la lógica para avanzar de ronda
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
                            // Limpiar modal si está activo
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
                        />
                        
                        {/* Renderizar el modal activo con validación mejorada */}
                        {activeModal==true && modal && (
                            showScoreInputModal({
                                matchData: modal.matchData,
                                tournamentId: modal.tournamentId,
                                isPlayersSet: modal.isPlayersSet,
                                onScoreUpdated: modal.onScoreUpdated,
                                onClose: modal.onClose
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