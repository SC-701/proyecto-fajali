import React, { useState, useEffect } from 'react';
import { getMyEliminationTournaments, TournamentStates, getStateName, getCategoryName } from '../../API/TournamentElimination.js';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingSpinner from '../UI/LoadingSpinner.jsx';
import CreateEliminationTournament from './CreateEliminationTournament.jsx';
import AccessTournamentModal from './AccessTournamentModal.jsx';
import './TournamentManager.css';
import './ModalBase.css'; 

const EliminationTournamentManager = ({ onTournamentSelect }) => {
    const { user } = useAuth();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('POR_INICIAR');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAccessModal, setShowAccessModal] = useState(false);

    useEffect(() => {
        loadTournaments();
    }, [activeTab]);

    const loadTournaments = async () => {
        setLoading(true);
        try {
            const stateValue = TournamentStates[activeTab];
            const result = await getMyEliminationTournaments(stateValue);

            if (result.success) {
                setTournaments(result.data || []);
            } else {
                setTournaments([]);
            }
        } catch (error) {
            console.error('Error loading tournaments:', error);
            setTournaments([]);
        } finally {
            setLoading(false);
        }
    };

    const getTournamentCount = (state) => {
        return tournaments.filter(t => t.estado === TournamentStates[state]).length;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStateColor = (state) => {
        const colors = {
            [TournamentStates.POR_INICIAR]: 'status-pending',
            [TournamentStates.EN_PROGRESO]: 'status-active',
            [TournamentStates.TERMINADO]: 'status-finished',
            [TournamentStates.CANCELADO]: 'status-cancelled'
        };
        return colors[state] || 'status-pending';
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="tournament-manager">
            <div className="tournament-manager-header">
                <h2>Gestión de Torneos de Eliminación</h2>
                <div className="header-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        🏆 Crear Torneo
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowAccessModal(true)}
                    >
                        🔑 Acceder con Clave
                    </button>
                </div>
            </div>

            {/* Pestañas de estado */}
            <div className="tournament-tabs">
                {Object.keys(TournamentStates).map(state => (
                    <button
                        key={state}
                        className={`tab-btn ${activeTab === state ? 'active' : ''}`}
                        onClick={() => setActiveTab(state)}
                    >
                        {getStateName(TournamentStates[state])} ({getTournamentCount(state)})
                    </button>
                ))}
            </div>

            {/* Lista de torneos */}
            <div className="tournaments-list">
                {tournaments.length === 0 ? (
                    <div className="empty-state">
                        <h3>No hay torneos en esta categoría</h3>
                        <p>No tienes torneos en estado "{getStateName(TournamentStates[activeTab])}"</p>
                        {activeTab === 'POR_INICIAR' && (
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowCreateModal(true)}
                            >
                                Crear primer torneo
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="tournaments-grid">
                        {tournaments.map(tournament => (
                            <div key={tournament.id} className="tournament-card">
                                <div className="card-header">
                                    <div className="tournament-info">
                                        <h3>{tournament.nombre}</h3>
                                        <div className="tournament-meta">
                                            <span className={`status-badge ${getStateColor(tournament.estado)}`}>
                                                {getStateName(tournament.estado)}
                                            </span>
                                            <span className="category-badge">
                                                {getCategoryName(tournament.categoria)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="tournament-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Deporte:</span>
                                        <span className="detail-value">{tournament.tipoDeporte}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Participantes:</span>
                                        <span className="detail-value">{tournament.participantes?.length || 0}/8</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Creado:</span>
                                        <span className="detail-value">{formatDate(tournament.fechaCreacion)}</span>
                                    </div>
                                    {tournament.esCreador && tournament.accessKey && (
                                        <div className="detail-item">
                                            <span className="detail-label">Clave:</span>
                                            <code className="access-key">{tournament.accessKey}</code>
                                        </div>
                                    )}
                                </div>

                                <div className="tournament-description">
                                    <p>{tournament.descripcion}</p>
                                </div>

                                <div className="card-actions">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => onTournamentSelect?.(tournament)}
                                    >
                                        {tournament.esCreador ? 'Gestionar' : 'Ver Bracket'}
                                    </button>

                                    {tournament.esCreador && tournament.accessKey && (
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                navigator.clipboard.writeText(tournament.accessKey);
                                            }}
                                        >
                                            📋 Copiar Clave
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modales */}
            {showCreateModal && (
                <CreateEliminationTournament
                    onClose={() => setShowCreateModal(false)}
                    onTournamentCreated={loadTournaments}
                />
            )}

            {showAccessModal && (
                <AccessTournamentModal
                    onClose={() => setShowAccessModal(false)}
                    onTournamentAccessed={onTournamentSelect}
                />
            )}
        </div>
    );
};

export default EliminationTournamentManager;