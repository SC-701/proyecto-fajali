import React from 'react';
import '../../styles/TournamentCard.css';

const TournamentCard = ({ tournament, onSelect, onJoin, onLeave, user }) => {
    const getStatusColor = (estado) => {
        const colors = {
            0: 'status-pending',
            1: 'status-active',
            2: 'status-finished',
            3: 'status-cancelled'
        };
        return colors[estado] || 'status-pending';
    };

    const getStatusText = (estado) => {
        const texts = {
            0: 'Por Iniciar',
            1: 'En Progreso',
            2: 'Terminado',
            3: 'Cancelado'
        };
        return texts[estado] || 'Desconocido';
    };

    const formatDate = (dateString) => { 
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="tournament-card-modern">
            <div className="card-header">
                <div className="tournament-info">
                    <h3>{tournament.nombre}</h3>
                    <div className="tournament-meta">
                        <span className={`status-badge ${getStatusColor(tournament.estado)}`}>
                            {getStatusText(tournament.estado)}
                        </span>
                        {tournament.categoria && (
                            <span className="category-badge">
                                {tournament.categoria}
                            </span>
                        )}
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
                    <span className="detail-value">
                        {tournament.participantes?.length || 0}/8
                    </span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Creado:</span>
                    <span className="detail-value">{formatDate(tournament.fechaCreacion)}</span>
                </div>
                {tournament.accessKey && tournament.esCreador && (
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
                    onClick={() => onSelect?.(tournament)}
                >
                    {tournament.esCreador ? 'Gestionar' : 'Ver Detalles'}
                </button>

                {tournament.accessKey && tournament.esCreador && (
                    <button
                        className="btn btn-secondary"
                        onClick={async () => {
                            if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                                try {
                                    await navigator.clipboard.writeText(tournament.accessKey);
                                    window.alert('Clave copiada al portapapeles.');
                                } catch (err) {
                                    window.alert('No se pudo copiar la clave. Inténtalo de nuevo.');
                                }
                            } else {
                                window.alert('La función de copiar no está disponible en este navegador.');
                            }
                        }}
                    >
                        📋 Copiar Clave
                    </button>
                )}
            </div>
        </div>
    );
};

export default TournamentCard;