import React from 'react';
import './BracketMatch.css';

const BracketMatch = ({
    match,
    matchIndex,
    round,
    roundName,
    isAdmin,
    canEdit,
    onMatchClick
}) => {
    const handleMatchClick = () => {
        if (isAdmin && canEdit && match.participantes?.length === 2) {
            onMatchClick?.({
                match,
                matchIndex,
                round,
                roundName
            });
        }
    };

    const getParticipantName = (participant) => {
        if (!participant || !participant.idJugador) {
            return 'TBD';
        }

        return participant.idJugador;
    };

    const isClickable = isAdmin && canEdit && match.participantes?.length >= 2;

    return (
        <div
            className={`bracket-match ${match.completado ? 'completed' : 'pending'} ${isClickable ? 'clickable' : ''}`}
            onClick={handleMatchClick}
        >
            <div className="match-header">
                <span className="match-number">Partido {matchIndex + 1}</span>
                {match.completado && (
                    <span className="match-status">✓</span>
                )}
            </div>

            <div className="match-participants">
                {match.participantes?.map((participant, index) => (
                    <div
                        key={index}
                        className={`participant ${participant.isWinner ? 'winner' : ''} ${match.completado ? 'completed' : 'pending'}`}
                    >
                        <div className="participant-info">
                            <span className="participant-name">
                                {getParticipantName(participant)}
                            </span>
                            {participant.isWinner && match.completado && (
                                <span className="winner-badge">👑</span>
                            )}
                        </div>
                        <div className="participant-score">
                            {match.completado ? participant.puntaje : '-'}
                        </div>
                    </div>
                ))}

                {/* Mostrar placeholders si no hay suficientes participantes */}
                {(!match.participantes || match.participantes.length < 2) && (
                    <>
                        {Array.from({ length: 2 - (match.participantes?.length || 0) }).map((_, index) => (
                            <div key={`placeholder-${index}`} className="participant placeholder">
                                <div className="participant-info">
                                    <span className="participant-name">Por definir</span>
                                </div>
                                <div className="participant-score">-</div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {isClickable && (
                <div className="match-action">
                    <small>Click para {match.completado ? 'editar' : 'ingresar'} resultado</small>
                </div>
            )}
        </div>
    );
};

export default BracketMatch;