import React from 'react';
import Swal from 'sweetalert2';
import { updateMatchScore } from '../../API/TournamentElimination.js';

export const showScoreInputModal = async (matchData, tournamentId, onScoreUpdated) => {
    const { match, round, matchIndex, roundName } = matchData;

    if (!match.participantes || match.participantes.length < 2) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No hay suficientes participantes para este partido'
        });
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