import React, { useState, useEffect } from 'react';
import { getAllTournaments, joinTournament, leaveTournament } from '../API/Tournament.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import Swal from 'sweetalert2';
import './Tournaments.css';

const Tournaments = () => {
    const { user } = useAuth();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadTournaments();
    }, []);

    const loadTournaments = async () => {
        setLoading(true);
        try {
            const result = await getAllTournaments();
            if (result.success) {
                setTournaments(result.data || []);
            } else {
                console.error('Error loading tournaments:', result.error);
            }
        } catch (error) {
            console.error('Error loading tournaments:', error);
        } finally {
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
                loadTournaments(); // Recargar la lista
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
                text: 'Error inesperado al inscribirse'
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
                    text: 'Error al salir del torneo'
                });
            }
        }
    };

    const getStatusColor = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'activo': return 'status-active';
            case 'pendiente': return 'status-pending';
            case 'finalizado': return 'status-finished';
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

    const filteredTournaments = tournaments.filter(tournament => {
        if (filter === 'all') return true;
        if (filter === 'active') return tournament.estado?.toLowerCase() === 'activo';
        if (filter === 'joined') return tournament.participantes?.includes(user?.id);
        return true;
    });

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="tournaments-page">
            <div className="tournaments-header">
                <h1>Torneos</h1>
                {user?.role === 'admin' && (
                    <button className="create-tournament-btn">
                        ? Crear Torneo
                    </button>
                )}
            </div>

            <div className="tournaments-filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Todos ({tournaments.length})
                </button>
                <button
                    className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                    onClick={() => setFilter('active')}
                >
                    Activos ({tournaments.filter(t => t.estado?.toLowerCase() === 'activo').length})
                </button>
                <button
                    className={`filter-btn ${filter === 'joined' ? 'active' : ''}`}
                    onClick={() => setFilter('joined')}
                >
                    Mis Torneos ({tournaments.filter(t => t.participantes?.includes(user?.id)).length})
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
                                    ?? {tournament.juego || 'No especificado'}
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
                                            {tournament.cuposDisponibles === 0 ? 'Cupos Agotados' : 'No Disponible'}
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