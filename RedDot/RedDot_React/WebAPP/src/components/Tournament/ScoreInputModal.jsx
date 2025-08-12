import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { changeMatchStatus, getTournament } from '../../API/Tournament.js';
import Modal from '../UI/Modal.jsx';

// Componente para el modal de agregar participantes
const AddParticipantsModal = ({ matchData, tournamentId, onScoreUpdated, onClose }) => {
    // VALIDACIÓN TEMPRANA MEJORADA
    if (!matchData) {
        console.error('AddParticipantsModal: matchData is null or undefined');
        // Llamar onClose después de un breve delay para evitar problemas de estado
        React.useEffect(() => {
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, 100);
            return () => clearTimeout(timer);
        }, [onClose]);

        return (
            <Modal
                title="Error"
                isOpen={true}
                onClose={onClose || (() => { })}
                children={<div>Error: Datos del partido no disponibles</div>}
            />
        );
    }

    // VALIDACIÓN MEJORADA DE LA ESTRUCTURA
    if (!matchData.match) {
        console.error('AddParticipantsModal: matchData.match is missing', matchData);
        React.useEffect(() => {
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, 100);
            return () => clearTimeout(timer);
        }, [onClose]);

        return (
            <Modal
                title="Error"
                isOpen={true}
                onClose={onClose || (() => { })}
                children={<div>Error: Estructura de datos del partido inválida</div>}
            />
        );
    }

    if (!matchData.roundName || matchData.matchIndex === undefined) {
        console.error('AddParticipantsModal: roundName or matchIndex is missing', matchData);
        React.useEffect(() => {
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, 100);
            return () => clearTimeout(timer);
        }, [onClose]);

        return (
            <Modal
                title="Error"
                isOpen={true}
                onClose={onClose || (() => { })}
                children={<div>Error: Información de ronda incompleta</div>}
            />
        );
    }

    // ESTADOS DEL COMPONENTE - Solo después de validaciones
    const { match, roundName, matchIndex } = matchData;
    const [bracketMatch, setBracketMatch] = useState(match);
    const [participantesTotales, setParticipantesTotales] = useState([]);
    const [partipantesTorneo, setPartipantesTorneo] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleActivePlayers = (participantesEnMatch) => {
        if (!Array.isArray(participantesEnMatch)) {
            console.warn('handleActivePlayers: participantesEnMatch no es un array', participantesEnMatch);
            return [];
        }
        return participantesEnMatch.filter(player => player && player.isSet !== true);
    };

    useEffect(() => {
        const loadTournament = async () => {
            try {
                if (!tournamentId) {
                    throw new Error('Tournament ID es requerido');
                }

                const resultado = await getTournament(tournamentId);

                if (!resultado.success) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al obtener el torneo',
                        text: resultado.error || 'No se pudo obtener el torneo'
                    });
                    if (onClose) onClose();
                    return;
                }

                if (!resultado.data || !resultado.data.participantes) {
                    throw new Error('Datos de participantes no disponibles');
                }

                setParticipantesTotales(handleActivePlayers(resultado.data.participantes || []));
                setPartipantesTorneo(resultado.data.participantes || []);
            } catch (error) {
                console.error('Error en loadTournament:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Error al cargar los participantes'
                });
                if (onClose) onClose();
            } finally {
                setLoading(false);
            }
        };

        loadTournament();
    }, [tournamentId, onClose]);

    const handleSubmit = async () => {
        try {
            // Validación antes de enviar
            if (!bracketMatch.participantes || bracketMatch.participantes.length < 2) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Faltan participantes',
                    text: 'Debes configurar ambos participantes'
                });
                return;
            }

            if (!bracketMatch.participantes[0]?.idJugador || !bracketMatch.participantes[1]?.idJugador) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Faltan participantes',
                    text: 'Debes seleccionar ambos participantes para continuar'
                });
                return;
            }

            if (bracketMatch.participantes[0].idJugador === bracketMatch.participantes[1].idJugador) {
                Swal.fire({
                    icon: 'error',
                    title: 'Participantes duplicados',
                    text: 'No puedes seleccionar el mismo participante dos veces'
                });
                return;
            }

            const result = await changeMatchStatus({
                participantes: partipantesTorneo
                , match: bracketMatch, tournamentId: tournamentId, roundName: roundName, matchIndex: matchIndex
            });
            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Participantes agregados correctamente'
                });
                    onScoreUpdated();
                if (onClose) onClose();
            } else {
                throw new Error(result.error || 'Error al actualizar los participantes');
            }
        } catch (error) {
            console.error('Error en handleSubmit:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
            });
        }
    };

    if (loading) {
        return (
            <Modal
                title="Cargando..."
                isOpen={true}
                onClose={onClose || (() => { })}
                children={<div>Cargando participantes...</div>}
            />
        );
    }

    return (
        <Modal
            title={`Agregar Participantes al Match ${roundName} - Partido ${matchIndex + 1}`}
            isOpen={true}
            onClose={onClose || (() => { })}
            onSubmit={handleSubmit}
            children={
                <div className="score-input-modal">
                    <h3>Partido {roundName} - Match {matchIndex + 1}</h3>
                    <div className="participants-list">
                        <span className="participants-title">Escoge al participante 1</span>
                        <select
                            name="participante1"
                            className="form-select"
                            value={bracketMatch.participantes && bracketMatch.participantes[0]?.idJugador ?
                                JSON.stringify({
                                    id: bracketMatch.participantes[0].idJugador,
                                    name: bracketMatch.participantes[0].nombre
                                }) : ''
                            }
                            onChange={(e) => {
                                if (e.target.value === '') {
                                    setBracketMatch(prev => ({
                                        ...prev,
                                        participantes: [
                                            {},
                                            (prev.participantes && prev.participantes[1]) || {}
                                        ]
                                    }));
                                    return;
                                }

                                try {
                                    const player1 = JSON.parse(e.target.value);

                                    if (bracketMatch.participantes && bracketMatch.participantes[1]?.idJugador === player1.id) {
                                        Swal.fire({
                                            icon: 'warning',
                                            title: 'Participante ya seleccionado',
                                            text: 'Este participante ya está seleccionado como Participante 2'
                                        });
                                        return;
                                    }

                                    setBracketMatch(prev => ({
                                        ...prev,
                                        participantes: [
                                            { ...(prev.participantes ? prev.participantes[0] : {}), idJugador: player1.id, nombre: player1.name },
                                            (prev.participantes && prev.participantes[1]) || {}
                                        ]
                                    }));
                                } catch (error) {
                                    console.error('Error parsing participant data:', error);
                                }
                            }}
                        >
                            <option value="">Selecciona un participante</option>
                            {participantesTotales.map(player => {
                                const isDisabled = bracketMatch.participantes && bracketMatch.participantes[1]?.idJugador === player.id;
                                return (
                                    <option
                                        key={player.id}
                                        value={JSON.stringify({ id: player.id, name: player.name })}
                                        disabled={isDisabled}
                                        style={{ color: isDisabled ? '#ccc' : 'inherit' }}
                                    >
                                        {player.name} {isDisabled ? '(Ya seleccionado)' : ''}
                                    </option>
                                );
                            })}
                        </select>

                        <span className="participants-title">Escoge al participante 2</span>
                        <select
                            name="participante2"
                            className="form-select"
                            value={bracketMatch.participantes && bracketMatch.participantes[1]?.idJugador ?
                                JSON.stringify({
                                    id: bracketMatch.participantes[1].idJugador,
                                    name: bracketMatch.participantes[1].nombre
                                }) : ''
                            }
                            onChange={(e) => {
                                if (e.target.value === '') {
                                    setBracketMatch(prev => ({
                                        ...prev,
                                        participantes: [
                                            (prev.participantes && prev.participantes[0]) || {},
                                            {}
                                        ]
                                    }));
                                    return;
                                }

                                try {
                                    const player2 = JSON.parse(e.target.value);

                                    if (bracketMatch.participantes && bracketMatch.participantes[0]?.idJugador === player2.id) {
                                        Swal.fire({
                                            icon: 'warning',
                                            title: 'Participante ya seleccionado',
                                            text: 'Este participante ya está seleccionado como Participante 1'
                                        });
                                        return;
                                    }

                                    setBracketMatch(prev => ({
                                        ...prev,
                                        participantes: [
                                            (prev.participantes && prev.participantes[0]) || {},
                                            { ...(prev.participantes ? prev.participantes[1] : {}), idJugador: player2.id, nombre: player2.name }
                                        ]
                                    }));
                                } catch (error) {
                                    console.error('Error parsing participant data:', error);
                                }
                            }}
                        >
                            <option value="">Selecciona un participante</option>
                            {participantesTotales.map(player => {
                                const isDisabled = bracketMatch.participantes && bracketMatch.participantes[0]?.idJugador === player.id;
                                return (
                                    <option
                                        key={player.id}
                                        value={JSON.stringify({ id: player.id, name: player.name })}
                                        disabled={isDisabled}
                                        style={{ color: isDisabled ? '#ccc' : 'inherit' }}
                                    >
                                        {player.name} {isDisabled ? '(Ya seleccionado)' : ''}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <button onClick={handleSubmit} className="btn btn-primary">Guardar Participantes</button>
                </div>
            }
        />
    );
};

// Función para mostrar el modal (ahora sin hooks)
export const showScoreInputModal = ({ matchData, tournamentId, isPlayersSet, OnCloseFuntion, onScoreUpdated }) => {
    // Validación de parámetros
    if (!matchData || !tournamentId) {
        console.error('showScoreInputModal: Faltan parámetros requeridos', { matchData, tournamentId });
        return null;
    }

    function changeBracket(matchData) {
        matchData.match.participantes = matchData.match.participantes.map(participant => {
            return {
                ...participant,
                isSet: false 
            };
        });
        return matchData;
    }



   
    const { match } = matchData;

    if (!match) {
        console.error('showScoreInputModal: matchData.match es requerido', matchData);
        return null;
    }

    if (!isPlayersSet) {
        return (
            <AddParticipantsModal
                matchData={matchData}
                tournamentId={tournamentId}
                onScoreUpdated={onScoreUpdated}
                onClose={OnCloseFuntion || (() => { })
                }
            />
        );


    };

    // Aquí puedes agregar la lógica para cuando ya hay jugadores establecidos
    // Por ahora retornamos null o podrías tener otro componente
    
    return null;
};