import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import BracketMatch from './BracketMatch.jsx';
import '../../styles/TournamentBracket.css';

const TournamentBracket = ({ tournament, onMatchClick, onAdvanceRound, onActivePlayers }) => {
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);

    if (!tournament || !tournament.rondas) {
        return (
            <div className="bracket-container">
                <div className="bracket-error">
                    <h3>No se pudieron cargar los datos del bracket</h3>
                    <p>Intenta recargar la página</p>
                </div>
            </div>
        );
    }

    const activePlayers = onActivePlayers ? onActivePlayers(tournament) : false;

    const rondas = tournament.rondas;
    const isAdmin = tournament.esCreador;

    const isRoundComplete = (matches) => {
        return matches && matches.length > 0 && matches.every(match => match.completado);
    };

    const getWinnerName = (winnerId) => {
        if (!winnerId) return 'Por definir';
        return tournament.participantes?.[winnerId] || winnerId;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleModalClose = () => {
        setShowModal(false);
    };

    return (
        <div className="bracket-container">
            <div className="bracket-header">
                <div className="tournament-info">
                    <hr />
                    <div className="tournament-meta">

                        <div className='card-header-bracket'>
                            <h4
                                onClick={() => setShowModal(true)}
                                style={{ cursor: 'pointer', color: '#007bff' }}
                                title="Click para ver detalles del torneo"
                            >
                                Detalles del Torneo
                            </h4>
                        </div>
                        <span className={`tournament-status status-${tournament.estado}`}>
                            {tournament.estado === 0 && 'Por Iniciar'}
                            {tournament.estado === 1 && 'Cuartos de Final'}
                            {tournament.estado === 2 && 'Semifinales'}
                            {tournament.estado === 3 && 'Finales'}
                            {tournament.estado === 4 && 'Finalizado'}
                        </span>
                    </div>
                </div>
                {isAdmin && tournament.estado === 0 && (
                    <div className="bracket-actions">

                        <button
                            className="btn btn-primary"
                            onClick={() => onAdvanceRound?.('cuartos')}
                        >
                            Avanzar a Cuartos de Final
                        </button>

                    </div>
                )}
                {isAdmin && isRoundComplete(rondas.cuartos) && tournament.estado === 1 && (
                    <button
                        className="btn btn-success btn-sm"
                        onClick={() => onAdvanceRound?.('semis')}
                    >
                        Avanzar a Semifinales
                    </button>
                )}

                {isAdmin && isRoundComplete(rondas.semis) && tournament.estado === 2 && (
                    <button
                        className="btn btn-success btn-sm"
                        onClick={() => onAdvanceRound?.('semis')}
                    >
                        Avanzar a Finales
                    </button>
                )}

                {isAdmin && isRoundComplete(rondas.final) && tournament.estado === 3 && (
                    <button
                        className="btn btn-warning btn-sm"
                        onClick={() => onAdvanceRound?.('final')}
                    >
                        Finalizar Torneo
                    </button>
                )}

                {
                    tournament.estado === 4 && rondas.ganador && (
                        <div className="champion-section">
                            <div className="champion-trophy">
                                <h3>🏆 CAMPEÓN</h3>
                                <div className="champion-name">
                                    {getWinnerName(rondas.ganador)}
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={handleModalClose}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Detalles del Torneo</h2>
                            <button
                                className="modal-close"
                                onClick={handleModalClose}
                                aria-label="Cerrar modal"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-section">
                                <h3>📋 Descripción</h3>
                                <p>{tournament.descripcion || 'Sin descripción disponible'}</p>
                            </div>

                            <div className="detail-section">
                                <h3>📜 Reglas</h3>
                                <p>{tournament.reglas || 'Sin reglas específicas'}</p>
                            </div>

                            <div className="detail-section">
                                <h3>📅 Fecha de Inicio</h3>
                                <p>{formatDate(tournament.fechaCreacion)}</p>
                            </div>

                            <div className="detail-section">
                                <h3>🏆 Premio</h3>
                                <p>{tournament.descripcionPremio || 'Sin premio especificado'}</p>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            <div className="bracket-grid">
                <div className="bracket-round">
                    <div className="round-header">
                        <h3>Cuartos de Final</h3>

                    </div>
                    <div className="round-matches">
                        {rondas.cuartos?.map((match, index) => (
                            <BracketMatch
                                key={`cuartos-${index}`}
                                match={match}
                                matchIndex={index}
                                round="cuartos"
                                matchState={tournament.estado}
                                roundName="Cuartos de Final"
                                isAdmin={isAdmin}
                                canEdit={activePlayers || tournament.estado === 1}
                                onMatchClick={(matchData) => onMatchClick?.({
                                    ...matchData,
                                    round: 'cuartos',
                                    matchIndex: index
                                })}
                            />
                        ))}
                    </div>
                </div>

                <div className="bracket-round">
                    <div className="round-header">
                        <h3>Semifinales</h3>
                        {isAdmin && isRoundComplete(rondas.semis) && tournament.estado === 1 && (
                            <button
                                className="btn btn-success btn-sm"
                                onClick={() => onAdvanceRound?.('semis')}
                            >
                                Avanzar a Final
                            </button>
                        )}
                    </div>
                    <div className="round-matches">
                        {rondas.semis?.map((match, index) => (
                            <BracketMatch
                                key={`semis-${index}`}
                                match={match}
                                matchIndex={index}
                                round="semis"
                                matchState={tournament.estado}
                                roundName="Semifinales"
                                isAdmin={isAdmin}
                                canEdit={activePlayers || tournament.estado === 2}
                                onMatchClick={(matchData) => onMatchClick?.({
                                    ...matchData,
                                    round: 'semis',
                                    matchIndex: index
                                })}
                            />
                        ))}
                    </div>
                </div>

                <div className="bracket-round">
                    <div className="round-header">
                        <h3>Final</h3>

                    </div>
                    <div className="round-matches">
                        {rondas.final?.map((match, index) => (
                            <BracketMatch
                                key={`final-${index}`}
                                match={match}
                                matchIndex={index}
                                round="final"
                                matchState={tournament.estado}
                                roundName="Final"
                                isAdmin={isAdmin}
                                canEdit={activePlayers || tournament.estado === 3}
                                onMatchClick={(matchData) => onMatchClick?.({
                                    ...matchData,
                                    round: 'final',
                                    matchIndex: index
                                })}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="bracket-footer">
                <div className="bracket-legend">
                    <div className="legend-item">
                        <span className="legend-color completed"></span>
                        <span>Partido completado</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color pending"></span>
                        <span>Partido pendiente</span>
                    </div>
                    {isAdmin && (
                        <div className="legend-item">
                            <span className="legend-color editable"></span>
                            <span>Click para editar resultado</span>
                        </div>
                    )}
                </div>

                {tournament.accessKey && !isAdmin && (
                    <div className="access-info">
                        <small>Accediendo con clave de solo lectura</small>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TournamentBracket;