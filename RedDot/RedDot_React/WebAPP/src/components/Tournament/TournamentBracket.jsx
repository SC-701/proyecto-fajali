import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import BracketMatch from './BracketMatch.jsx';
import './TournamentBracket.css';

const TournamentBracket = ({ tournament, onMatchClick, onAdvanceRound }) => {
    const { user } = useAuth();

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

    const rondas = tournament.rondas;
    const isAdmin = tournament.esCreador;

    const isRoundComplete = (matches) => {
        return matches && matches.length > 0 && matches.every(match => match.completado);
    };

    const getWinnerName = (winnerId) => {
        if (!winnerId) return 'Por definir';
        return tournament.participantes?.[winnerId] || winnerId;
    };

    return (
        <div className="bracket-container-compact">
            {/* Mostrar ganador si el torneo está terminado */}
            {tournament.estado === 2 && rondas.ganador && (
                <div className="champion-section">
                    <div className="champion-trophy">
                        <h3>🏆 CAMPEÓN</h3>
                        <div className="champion-name">
                            {getWinnerName(rondas.ganador)}
                        </div>
                    </div>
                </div>
            )}

            <div className="bracket-grid">
                {/* Cuartos de Final */}
                <div className="bracket-round">
                    <div className="round-header">
                        <h3>Cuartos de Final</h3>
                        {isAdmin && isRoundComplete(rondas.cuartos) && tournament.estado === 1 && (
                            <button
                                className="btn btn-success btn-sm"
                                onClick={() => onAdvanceRound?.('cuartos')}
                            >
                                Avanzar a Semifinales
                            </button>
                        )}
                    </div>
                    <div className="round-matches">
                        {rondas.cuartos?.map((match, index) => (
                            <BracketMatch
                                key={`cuartos-${index}`}
                                match={match}
                                matchIndex={index}
                                round="cuartos"
                                roundName="Cuartos de Final"
                                isAdmin={isAdmin}
                                canEdit={tournament.estado === 0}
                                onMatchClick={(matchData) => onMatchClick?.({
                                    ...matchData,
                                    round: 'cuartos',
                                    matchIndex: index
                                })}
                            />
                        ))}
                    </div>
                </div>

                {/* Semifinales */}
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
                                roundName="Semifinales"
                                isAdmin={isAdmin}
                                canEdit={tournament.estado === 1}
                                onMatchClick={(matchData) => onMatchClick?.({
                                    ...matchData,
                                    round: 'semis',
                                    matchIndex: index
                                })}
                            />
                        ))}
                    </div>
                </div>

                {/* Final */}
                <div className="bracket-round">
                    <div className="round-header">
                        <h3>Final</h3>
                        {isAdmin && isRoundComplete(rondas.final) && tournament.estado === 1 && (
                            <button
                                className="btn btn-warning btn-sm"
                                onClick={() => onAdvanceRound?.('final')}
                            >
                                Finalizar Torneo
                            </button>
                        )}
                    </div>
                    <div className="round-matches">
                        {rondas.final?.map((match, index) => (
                            <BracketMatch
                                key={`final-${index}`}
                                match={match}
                                matchIndex={index}
                                round="final"
                                roundName="Final"
                                isAdmin={isAdmin}
                                canEdit={tournament.estado === 1}
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

            {/* Información adicional */}
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