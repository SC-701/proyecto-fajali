import React from 'react';
import Swal from 'sweetalert2';
import { updateMatchScore, getTournament } from '../../API/Tournament.js';

export const showScoreInputModal = async (matchData, tournamentId, isPlayersSet,onScoreUpdated) => {
    const { match, round, matchIndex, roundName } = matchData;

    // Si no hay jugadores asignados, mostrar modal de selección de participantes
    if (!isPlayersSet) {
        await showAddParticipantsModal(matchData, tournamentId, onScoreUpdated);
        return;
    }

    const participant1 = match.participantes[0];
    const participant2 = match.participantes[1];

    const { value: scores } = await Swal.fire({
        title: `${roundName} - Partido ${matchIndex + 1}`,
        html: `
            <div style="text-align: left; margin: 20px 0;">
                <h4 style="color: #374151; margin-bottom: 15px;">Ingresa los puntajes:</h4>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #4b5563;">
                        ${participant1.idJugador}
                    </label>
                    <input 
                        id="score1" 
                        type="number" 
                        min="0" 
                        max="999"
                        value="${participant1.puntaje || 0}"
                        style="width: 100%; padding: 8px; border: 2px solid #d1d5db; border-radius: 6px; font-size: 16px;"
                        placeholder="Puntaje participante 1"
                    />
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #4b5563;">
                        ${participant2.idJugador}
                    </label>
                    <input 
                        id="score2" 
                        type="number" 
                        min="0" 
                        max="999"
                        value="${participant2.puntaje || 0}"
                        style="width: 100%; padding: 8px; border: 2px solid #d1d5db; border-radius: 6px; font-size: 16px;"
                        placeholder="Puntaje participante 2"
                    />
                </div>
                
                <div style="background: #f3f4f6; padding: 10px; border-radius: 6px; margin-top: 15px;">
                    <small style="color: #6b7280;">
                        <strong>Nota:</strong> El participante con mayor puntaje será marcado como ganador automáticamente.
                    </small>
                </div>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar Resultado',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#059669',
        cancelButtonColor: '#6b7280',
        preConfirm: () => {
            const score1 = parseInt(document.getElementById('score1').value);
            const score2 = parseInt(document.getElementById('score2').value);

            // Validaciones
            if (isNaN(score1) || isNaN(score2)) {
                Swal.showValidationMessage('Por favor ingresa puntajes válidos');
                return false;
            }

            if (score1 < 0 || score2 < 0) {
                Swal.showValidationMessage('Los puntajes no pueden ser negativos');
                return false;
            }

            if (score1 === score2) {
                Swal.showValidationMessage('No se permiten empates. Debe haber un ganador.');
                return false;
            }

            return { score1, score2 };
        }
    });

    // Si el usuario confirmó, procesar los puntajes
    if (scores) {
        const { score1, score2 } = scores;

        // Preparar los datos de los participantes con puntajes actualizados
        const updatedParticipants = [
            {
                idJugador: participant1.idJugador,
                puntaje: score1,
                isWinner: score1 > score2
            },
            {
                idJugador: participant2.idJugador,
                puntaje: score2,
                isWinner: score2 > score1
            }
        ];

        // Mostrar loading
        Swal.fire({
            title: 'Guardando resultado...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // Llamar a la API para actualizar el puntaje
            const result = await updateMatchScore({
                idTorneo: tournamentId,
                ronda: round,
                indicePartido: matchIndex,
                participantes: updatedParticipants
            });

            if (result.success) {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Resultado guardado!',
                    html: `
                        <div style="text-align: center;">
                            <h4 style="color: #059669; margin: 15px 0;">Resultado del partido:</h4>
                            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 10px 0;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                    <span style="font-weight: bold;">${participant1.idJugador}</span>
                                    <span style="font-size: 20px; font-weight: bold; color: ${score1 > score2 ? '#059669' : '#6b7280'};">
                                        ${score1}
                                    </span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-weight: bold;">${participant2.idJugador}</span>
                                    <span style="font-size: 20px; font-weight: bold; color: ${score2 > score1 ? '#059669' : '#6b7280'};">
                                        ${score2}
                                    </span>
                                </div>
                            </div>
                            <div style="margin-top: 15px;">
                                <span style="color: #059669; font-weight: bold;">
                                    🏆 Ganador: ${score1 > score2 ? participant1.idJugador : participant2.idJugador}
                                </span>
                            </div>
                        </div>
                    `,
                    timer: 3000,
                    showConfirmButton: false
                });

                // Notificar al componente padre para refrescar los datos
                onScoreUpdated?.();
            } else {
                throw new Error(result.error || 'Error al guardar el resultado');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al guardar',
                text: error.message || 'No se pudo guardar el resultado. Intenta de nuevo.'
            });
        }
    }
};

// Función para agregar participantes (modal de selección)
export const showAddParticipantsModal = async (matchData, tournamentId, onParticipantsUpdated) => {
    const { match, round, matchIndex, roundName } = matchData;

    // Mostrar loading mientras obtenemos los participantes
    Swal.fire({
        title: 'Cargando participantes...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        // Obtener la información del torneo y sus participantes
        const tournamentData = await getTournament(tournamentId);
        
        if (!tournamentData.success || !tournamentData.data.participantes) {
            throw new Error('No se pudieron cargar los participantes del torneo');
        }

        const availableParticipants = tournamentData.data.participantes;

        if (availableParticipants.length < 2) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No hay suficientes participantes en el torneo (mínimo 2 requeridos)'
            });
            return;
        }

        // Crear las opciones para los dropdowns
        const participantOptions = availableParticipants
            .map(participant => `<option value="${participant.idJugador}">${participant.idJugador}</option>`)
            .join('');

        // Obtener participantes actuales si existen
        const currentParticipant1 = match?.participantes?.[0]?.idJugador || '';
        const currentParticipant2 = match?.participantes?.[1]?.idJugador || '';

        const { value: selectedParticipants } = await Swal.fire({
            title: `${roundName} - Partido ${matchIndex + 1}`,
            html: `
                <div style="text-align: left; margin: 20px 0;">
                    <h4 style="color: #374151; margin-bottom: 15px;">Selecciona los participantes:</h4>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #4b5563;">
                            Participante 1:
                        </label>
                        <select 
                            id="participant1" 
                            style="width: 100%; padding: 8px; border: 2px solid #d1d5db; border-radius: 6px; font-size: 16px; background-color: white;"
                        >
                            <option value="">-- Selecciona un participante --</option>
                            ${participantOptions}
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #4b5563;">
                            Participante 2:
                        </label>
                        <select 
                            id="participant2" 
                            style="width: 100%; padding: 8px; border: 2px solid #d1d5db; border-radius: 6px; font-size: 16px; background-color: white;"
                        >
                            <option value="">-- Selecciona un participante --</option>
                            ${participantOptions}
                        </select>
                    </div>
                    
                    <div style="background: #f3f4f6; padding: 10px; border-radius: 6px; margin-top: 15px;">
                        <small style="color: #6b7280;">
                            <strong>Nota:</strong> No puedes seleccionar el mismo participante dos veces.
                        </small>
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Asignar Participantes',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#059669',
            cancelButtonColor: '#6b7280',
            didOpen: () => {
                // Establecer valores actuales si existen
                if (currentParticipant1) {
                    document.getElementById('participant1').value = currentParticipant1;
                }
                if (currentParticipant2) {
                    document.getElementById('participant2').value = currentParticipant2;
                }

                // Agregar event listeners para evitar selección duplicada
                const participant1Select = document.getElementById('participant1');
                const participant2Select = document.getElementById('participant2');

                const updateOptions = () => {
                    const participant1Value = participant1Select.value;
                    const participant2Value = participant2Select.value;

                    // Deshabilitar opciones ya seleccionadas
                    Array.from(participant1Select.options).forEach(option => {
                        option.disabled = option.value === participant2Value && option.value !== '';
                    });

                    Array.from(participant2Select.options).forEach(option => {
                        option.disabled = option.value === participant1Value && option.value !== '';
                    });
                };

                participant1Select.addEventListener('change', updateOptions);
                participant2Select.addEventListener('change', updateOptions);
                updateOptions(); // Aplicar al cargar
            },
            preConfirm: () => {
                const participant1 = document.getElementById('participant1').value;
                const participant2 = document.getElementById('participant2').value;

                // Validaciones
                if (!participant1 || !participant2) {
                    Swal.showValidationMessage('Por favor selecciona ambos participantes');
                    return false;
                }

                if (participant1 === participant2) {
                    Swal.showValidationMessage('No puedes seleccionar el mismo participante dos veces');
                    return false;
                }

                return { participant1, participant2 };
            }
        });

        // Si el usuario confirmó, procesar la asignación
        if (selectedParticipants) {
            const { participant1, participant2 } = selectedParticipants;

            // Mostrar confirmación
            await Swal.fire({
                icon: 'success',
                title: '¡Participantes asignados!',
                html: `
                    <div style="text-align: center;">
                        <h4 style="color: #059669; margin: 15px 0;">Partido configurado:</h4>
                        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 10px 0;">
                            <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 10px;">
                                <span style="font-weight: bold; font-size: 18px;">${participant1}</span>
                            </div>
                            <div style="margin: 10px 0; color: #6b7280; font-size: 14px;">
                                VS
                            </div>
                            <div style="display: flex; justify-content: center; align-items: center;">
                                <span style="font-weight: bold; font-size: 18px;">${participant2}</span>
                            </div>
                        </div>
                        <div style="margin-top: 15px;">
                            <small style="color: #6b7280;">
                                Ahora puedes ingresar los puntajes cuando el partido termine.
                            </small>
                        </div>
                    </div>
                `,
                timer: 3000,
                showConfirmButton: false
            });

            // Notificar al componente padre para actualizar los datos
            onParticipantsUpdated?.();
        }

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudieron cargar los participantes. Intenta de nuevo.'
        });
    }
};

// Función para confirmar avance de ronda
export const showAdvanceRoundModal = async (round, onAdvanceConfirmed) => {
    const roundNames = {
        'cuartos': 'Semifinales',
        'semis': 'Final',
        'final': 'Finalizar Torneo'
    };

    const nextRound = roundNames[round];
    const isFinishing = round === 'final';

    const result = await Swal.fire({
        title: isFinishing ? '🏆 ¿Finalizar Torneo?' : `🚀 ¿Avanzar a ${nextRound}?`,
        html: isFinishing
            ? `
                <div style="text-align: center;">
                    <p style="margin: 15px 0;">Esto marcará el torneo como <strong>terminado</strong> y definirá al campeón.</p>
                    <div style="background: #fef3c7; padding: 10px; border-radius: 6px; margin: 10px 0;">
                        <small style="color: #92400e;">
                            <strong>⚠️ Advertencia:</strong> Esta acción no se puede deshacer.
                        </small>
                    </div>
                </div>
            `
            : `
                <div style="text-align: center;">
                    <p style="margin: 15px 0;">Los ganadores de la ronda actual avanzarán a <strong>${nextRound}</strong>.</p>
                    <div style="background: #dbeafe; padding: 10px; border-radius: 6px; margin: 10px 0;">
                        <small style="color: #1e40af;">
                            <strong>ℹ️ Información:</strong> Asegúrate de que todos los resultados estén correctos.
                        </small>
                    </div>
                </div>
            `,
        icon: isFinishing ? 'warning' : 'question',
        showCancelButton: true,
        confirmButtonText: isFinishing ? 'Sí, finalizar' : `Sí, avanzar a ${nextRound}`,
        cancelButtonText: 'Cancelar',
        confirmButtonColor: isFinishing ? '#dc2626' : '#059669',
        cancelButtonColor: '#6b7280'
    });

    if (result.isConfirmed) {
        onAdvanceConfirmed?.(round);
    }
};