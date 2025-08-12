import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getTournament,
    TournamentStates
} from '../../API/Tournament.js';
import { searchUsers } from '../../API/User.js';
import Swal from 'sweetalert2';
import './TournamentParticipants.css';

const TournamentParticipants = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar datos del torneo
    useEffect(() => {
        const loadTournament = async () => {
            try {
                const result = await getTournament(id);
                if (result.success) {
                    setTournament(result.data);
                    setError(null);
                } else {
                    setError(result.error?.[0]?.title || 'Error al cargar el torneo');
                }
            } catch (err) {
                setError('Error inesperado al cargar el torneo');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadTournament();
    }, [id]);

    // Buscar usuarios
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            Swal.fire({
                title: 'Buscando usuarios...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const result = await searchUsers(searchQuery);

            if (result.success) {
                // Filtrar usuarios ya seleccionados o ya en el torneo
                const participantesIds = tournament?.participantes?.map(p => p.id) || [];
                const seleccionadosIds = selectedUsers.map(s => s.id);

                const filtrados = result.data.filter(usuario =>
                    !participantesIds.includes(usuario.id) &&
                    !seleccionadosIds.includes(usuario.id)
                );

                setSearchResults(filtrados);
                Swal.close();
            } else {
                throw new Error(result.error?.[0]?.title || 'Error al buscar usuarios');
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Error al buscar usuarios'
            });
        }
    };

    // Seleccionar un usuario
    const selectUser = (user) => {
        if ((tournament?.participantes?.length || 0) + selectedUsers.length >= 8) {
            Swal.fire({
                icon: 'warning',
                title: 'L�mite alcanzado',
                text: 'Ya se alcanz� el m�ximo de 8 participantes'
            });
            return;
        }

        setSelectedUsers([...selectedUsers, user]);
        setSearchResults(searchResults.filter(u => u.id !== user.id));
    };

    // Quitar un usuario seleccionado
    const removeSelectedUser = (user) => {
        setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    };

    // Guardar participantes
    const saveParticipants = async () => {
        if (selectedUsers.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                text: 'Debes seleccionar al menos un participante'
            });
            return;
        }

        try {
            Swal.fire({
                title: 'Guardando participantes...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const participantsIds = selectedUsers.map(u => u.id);
            const result = await addTournamentParticipants(id, participantsIds);

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: '�xito',
                    text: 'Participantes agregados correctamente'
                });

                setSelectedUsers([]);

                // Recargar datos del torneo
                const tournamentResult = await getTournament(id);
                if (tournamentResult.success) {
                    setTournament(tournamentResult.data);
                }
            } else {
                throw new Error(result.error?.[0]?.title || 'Error al agregar participantes');
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Error al agregar participantes'
            });
        }
    };

    // Iniciar torneo
    const startTournament = async () => {
        try {
            if (!tournament || tournament.participantes.length !== 8) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No se puede iniciar',
                    text: 'El torneo debe tener exactamente 8 participantes para iniciarlo'
                });
                return;
            }

            Swal.fire({
                title: 'Iniciando torneo...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const result = await changeTournamentStatus(id, TournamentStates.EN_PROGRESO);

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Torneo iniciado',
                    text: 'El torneo ha sido iniciado correctamente'
                }).then(() => {
                    navigate(`/torneos/${id}`);
                });
            } else {
                throw new Error(result.error?.[0]?.title || 'Error al iniciar el torneo');
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Error al iniciar el torneo'
            });
        }
    };

    if (loading) {
        return <div className="loading-container">Cargando datos del torneo...</div>;
    }

    if (!tournament) {
        return <div className="error-container">No se pudo cargar el torneo</div>;
    }

    return (
        <div className="tournament-participants-container">
            <div className="tournament-header">
                <h2>Gesti�n de Participantes: {tournament.nombre}</h2>
                <div className="tournament-status">
                    Estado actual: <span className={`status-badge status-${tournament.estado}`}>
                        {tournament.estado === TournamentStates.POR_INICIAR ? 'Por Iniciar' : 'En Progreso'}
                    </span>
                </div>

                {error && <div className="error-message">{error}</div>}
            </div>

            <div className="participants-section">
                <div className="current-participants">
                    <div className="section-card">
                        <div className="card-header">
                            Participantes Actuales ({tournament.participantes?.length || 0}/8)
                        </div>
                        <div className="card-body">
                            {tournament.participantes?.length > 0 ? (
                                <ul className="participants-list">
                                    {tournament.participantes.map((participante, index) => (
                                        <li key={index} className="participant-item">
                                            {participante.username || participante.nombre}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="info-message">No hay participantes en el torneo</div>
                            )}
                        </div>
                    </div>

                    {tournament.esCreador && tournament.estado === 0 && (
                        <div className="start-tournament">
                            <button
                                className="btn btn-success"
                                onClick={startTournament}
                                disabled={tournament.participantes?.length !== 8}
                            >
                                Iniciar Torneo
                            </button>
                            {tournament.participantes?.length !== 8 && (
                                <div className="warning-message">
                                    Se necesitan exactamente 8 participantes para iniciar el torneo.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {tournament.esCreador && tournament.estado === 0 && (
                    <div className="add-participants">
                        <div className="section-card">
                            <div className="card-header">Agregar Participantes</div>
                            <div className="card-body">
                                <div className="search-form">
                                    <label>Buscar Usuarios</label>
                                    <div className="search-input">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Nombre de usuario..."
                                        />
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleSearch}
                                        >
                                            Buscar
                                        </button>
                                    </div>
                                </div>

                                {searchResults.length > 0 && (
                                    <div className="search-results">
                                        <h6>Resultados de b�squeda:</h6>
                                        <ul className="results-list">
                                            {searchResults.map(user => (
                                                <li key={user.id} className="result-item">
                                                    <span>{user.username}</span>
                                                    <button
                                                        className="btn btn-small btn-outline"
                                                        onClick={() => selectUser(user)}
                                                    >
                                                        Agregar
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedUsers.length > 0 && (
                                    <div className="selected-users">
                                        <h6>Usuarios seleccionados:</h6>
                                        <ul className="selected-list">
                                            {selectedUsers.map(user => (
                                                <li key={user.id} className="selected-item">
                                                    <span>{user.username}</span>
                                                    <button
                                                        className="btn btn-small btn-danger"
                                                        onClick={() => removeSelectedUser(user)}
                                                    >
                                                        Quitar
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            className="btn btn-primary save-button"
                                            onClick={saveParticipants}
                                        >
                                            Guardar Participantes
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="back-button">
                <button className="btn btn-secondary" onClick={() => navigate(`/torneos/${id}`)}>
                    Volver al Torneo
                </button>
            </div>
        </div>
    );
};

export default TournamentParticipants;