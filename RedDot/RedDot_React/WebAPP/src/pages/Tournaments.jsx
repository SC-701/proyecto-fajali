import React, { useState, useEffect } from 'react';
import { getAllTournaments, joinTournament, leaveTournament } from '../API/Tournament.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import EliminationTournamentManager from '../components/Tournament/EliminationTournamentManager.jsx';
import TournamentBracket from '../components/Tournament/TournamentBracket.jsx';
import { showScoreInputModal, showAdvanceRoundModal } from '../components/Tournament/ScoreInputModal.jsx';
import { useTournament } from '../hooks/useTournament.js';
import { updateMatchScore, advanceRound } from '../API/TournamentElimination.js';
import Swal from 'sweetalert2';
import '../styles/Tournaments.css';

const Tournaments = () => {
    const { user } = useAuth();
    const [activeView, setActiveView] = useState('traditional'); // 'traditional' | 'elimination' | 'bracket'
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    // Hook para torneo de eliminación seleccionado
    const { tournament: eliminationTournament, refreshTournament } = useTournament(
        selectedTournament?.id,
        selectedTournament?.accessKey
    );

    useEffect(() => {
        if (activeView === 'traditional') {
            loadTournaments();
        }
    }, [activeView]);

    const loadTournaments = async () => {
        console.log('🎯 useEffect triggered, calling loadTournaments');
        setLoading(true);
        try {
            console.log('🔄 Calling getAllTournaments...');
            const result = await getAllTournaments();
            console.log('🔍 API Response:', result);

            if (result.success) {
                const tournamentsData = Array.isArray(result.data.torneos) ? result.data.torneos : [];
                console.log('🔍 Tournaments Data (processed):', tournamentsData);
                setTournaments(tournamentsData);
            } else {
                console.error('❌ API returned success: false', result.error);
                setTournaments([]);
            }
        } catch (error) {
            console.error('💥 Exception in loadTournaments:', error);
            setTournaments([]);
        } finally {
            console.log('🏁 loadTournaments FINISHED');
            setLoading(false);
        }
    };

    const handleJoinTournament = async (tournamentId) => {
        try {
            const result = await joinTournament(tournamentId);
            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Inscrito!',
                    text: 'Te has inscrito al torneo exitosamente',
                    timer: 1500,
                    showConfirmButton: false
                });
                loadTournaments();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.error[0]?.title || 'No se pudo inscribir al torneo'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error inesperado al inscribirse: ' + error.message || 'Error inesperado'
            });
        }
    };

    const handleLeaveTournament = async (tournamentId) => {
        const confirmResult = await Swal.fire({
            title: '¿Salir del torneo?',
            text: "¿Estás seguro que deseas salir de este torneo?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar'
        });

        if (confirmResult.isConfirmed) {
            try {
                const result = await leaveTournament(tournamentId);
                if (result.success) {
                    Swal.fire('¡Listo!', 'Has salido del torneo', 'success');
                    loadTournaments();
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al salir del torneo: ' + error.message || 'Error inesperado'
                });
            }
        }
    };

    // Handlers para torneos de eliminación
    const handleTournamentSelect = (tournament) => {
        setSelectedTournament(tournament);
        setActiveView('bracket');
    };

    const handleMatchClick = async (matchData) => {
        if (!selectedTournament || !eliminationTournament?.esCreador) return;

        await showScoreInputModal(matchData, selectedTournament.id, refreshTournament);
    };

    const handleAdvanceRound = async (round) => {
        if (!selectedTournament || !eliminationTournament?.esCreador) return;

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
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'No se pudo avanzar la ronda'
                });
            }
        });
    };

    const getStatusColor = (estado) => {
        switch (estado) {
            case 0: return 'status-open';
            case 1: return 'status-active';
            case 2: return 'status-finished';
            case 3: return 'status-cancelled';
            default: return 'status-pending';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getProgress = (tournament) => {
        const total = tournament.cuposMaximos || 0;
        const occupied = total - (tournament.cuposDisponibles || 0);
        return total > 0 ? Math.round((occupied / total) * 100) : 0;
    };

    const filteredTournaments = (tournaments || []).filter(tournament => {
        if (filter === 'all') return true;
        if (filter === 'active') return tournament.estado === 1;
        if (filter === 'joined') return tournament.participantes?.includes(user?.id);
        return true;
    });

    // Renderizado condicional basado en la vista activa
    if (activeView === 'bracket' && selectedTournament) {
        return (
            <div className="tournaments-page">
                <div className="tournaments-header">
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            setActiveView('elimination');
                            setSelectedTournament(null);
                        }}
                    >
                        ← Volver a Torneos
                    </button>
                    <h1>Bracket del Torneo</h1>
                </div>

                {eliminationTournament ? (
                    <TournamentBracket
                        tournament={eliminationTournament}
                        onMatchClick={handleMatchClick}
                        onAdvanceRound={handleAdvanceRound}
                    />
                ) : (
                    <LoadingSpinner />
                )}
            </div>
        );
    }

    if (activeView === 'elimination') {
        return (
            <div className="tournaments-page">
                <div className="tournaments-header">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setActiveView('traditional')}
                    >
                        ← Torneos Tradicionales
                    </button>
                    <h1>Torneos de Eliminación Directa</h1>
                </div>

                <EliminationTournamentManager
                    onTournamentSelect={handleTournamentSelect}
                />
            </div>
        );
    }

    // Vista tradicional de torneos
    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="tournaments-page">
            <div className="tournaments-header">
                <h1>Torneos</h1>
                <div className="header-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setActiveView('elimination')}
                    >
                        ⚡ Torneos de Eliminación
                    </button>
                    {user?.role === 'admin' && (
                        <button className="create-tournament-btn">
                            🏆 Crear Torneo
                        </button>
                    )}
                </div>
            </div>

            <div className="tournaments-filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Todos ({(tournaments || []).length})
                </button>
                <button
                    className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                    onClick={() => setFilter('active')}
                >
                    Activos ({(tournaments || []).filter(t => t.estado === 1).length})
                </button>
                <button
                    className={`filter-btn ${filter === 'joined' ? 'active' : ''}`}
                    onClick={() => setFilter('joined')}
                >
                    Mis Torneos ({(tournaments || []).filter(t => t.participantes?.includes(user?.id)).length})
                </button>
            </div>

            {filteredTournaments.length === 0 ? (
                <div className="empty-state">
                    <h3>No hay torneos disponibles</h3>
                    <p>No se encontraron torneos que coincidan con los filtros seleccionados.</p>
                </div>
            ) : (
                <div className="tournaments-grid">
                    {filteredTournaments.map(tournament => {
                        const isUserJoined = tournament.participantes?.includes(user?.id);
                        const canJoin = tournament.cuposDisponibles > 0 && !isUserJoined;

                        return (
                            <div key={tournament.id} className="tournament-card">
                                <div className="card-header">
                                    <div className="tournament-title">
                                        <h3>{tournament.nombre}</h3>
                                        <span className={`status-badge ${getStatusColor(tournament.estado)}`}>
                                            {tournament.estado}
                                        </span>
                                    </div>
                                </div>

                                <div className="tournament-game">
                                    🎮 {tournament.juego || 'No especificado'}
                                </div>

                                <div className="tournament-dates">
                                    <div className="date-item">
                                        <span className="date-label">Inicio:</span>
                                        <span className="date-value">
                                            {formatDate(tournament.fechaInicio)}
                                        </span>
                                    </div>
                                    <div className="date-item">
                                        <span className="date-label">Fin:</span>
                                        <span className="date-value">
                                            {formatDate(tournament.fechaFin)}
                                        </span>
                                    </div>
                                </div>

                                <div className="tournament-capacity">
                                    <div className="capacity-info">
                                        <span>Cupos: {tournament.cuposDisponibles} / {tournament.cuposMaximos}</span>
                                        <span>{getProgress(tournament)}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${getProgress(tournament)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {tournament.descripcion && (
                                    <div className="tournament-description">
                                        <p>{tournament.descripcion}</p>
                                    </div>
                                )}

                                <div className="card-actions">
                                    {isUserJoined ? (
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleLeaveTournament(tournament.id)}
                                        >
                                            Salir del Torneo
                                        </button>
                                    ) : canJoin ? (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleJoinTournament(tournament.id)}
                                        >
                                            Inscribirse
                                        </button>
                                    ) : (
                                        <button className="btn btn-disabled" disabled>
                                            {tournament.participantes >= tournament.cupos_maximos === 0 ? 'Cupos Agotados' : 'No Disponible'}
                                        </button>
                                    )}

                                    <button className="btn btn-secondary">
                                        Ver Detalles
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Tournaments;