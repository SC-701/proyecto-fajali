using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos;
using DA.Entidades;

namespace Flujo.Torneos
{
    public class TorneosFlujo : ITorneosFlujo
    {
        private readonly ITorneosDA _torneosDA;

        public TorneosFlujo(ITorneosDA torneosDA)
        {
            _torneosDA = torneosDA;
        }

        public async Task<string> CrearTorneo(SolicitudCrearTorneo torneo, string creadoPor)
        {
            // Validaciones de lógica de negocio
            if (torneo.FechaInicio <= DateTime.UtcNow)
            {
                throw new ArgumentException("La fecha de inicio debe ser posterior a la fecha actual");
            }

            if (torneo.FechaFin <= torneo.FechaInicio)
            {
                throw new ArgumentException("La fecha de fin debe ser posterior a la fecha de inicio");
            }

            if (torneo.FechaLimiteInscripcion >= torneo.FechaInicio)
            {
                throw new ArgumentException("La fecha límite de inscripción debe ser anterior a la fecha de inicio");
            }

            if (torneo.FechaLimiteInscripcion <= DateTime.UtcNow)
            {
                throw new ArgumentException("La fecha límite de inscripción debe ser posterior a la fecha actual");
            }

            if (torneo.CuposMaximos < 2)
            {
                throw new ArgumentException("El torneo debe tener al menos 2 cupos");
            }

            var resultado = await _torneosDA.CrearTorneo(torneo, creadoPor);

            if (string.IsNullOrEmpty(resultado))
            {
                throw new Exception("Error al crear el torneo en la base de datos");
            }

            return resultado;
        }

        public async Task<bool> ActualizarTorneo(SolicitudActualizarTorneo torneo, string nombreUsuario)
        {
            // Verificar que el torneo existe y pertenece al usuario
            var torneoExistente = await _torneosDA.ObtenerTorneoPorId(torneo.Id);
            if (torneoExistente == null)
            {
                throw new ArgumentException("El torneo no existe");
            }

            if (torneoExistente.CreadoPor != nombreUsuario)
            {
                throw new UnauthorizedAccessException("No tienes permisos para modificar este torneo");
            }

            // Validaciones de lógica de negocio
            if (torneo.FechaFin <= torneo.FechaInicio)
            {
                throw new ArgumentException("La fecha de fin debe ser posterior a la fecha de inicio");
            }

            if (torneo.FechaLimiteInscripcion >= torneo.FechaInicio)
            {
                throw new ArgumentException("La fecha límite de inscripción debe ser anterior a la fecha de inicio");
            }

            // No permitir reducir el máximo de participantes por debajo del actual
            if (torneo.CuposMaximos < torneoExistente.ParticipantesActuales)
            {
                throw new ArgumentException($"No puedes reducir el máximo de participantes por debajo del número actual ({torneoExistente.ParticipantesActuales})");
            }

            // Validar cambios de estado
            if (!ValidarCambioEstado(torneoExistente.Estado, torneo.Estado))
            {
                throw new ArgumentException("Cambio de estado no válido");
            }

            return await _torneosDA.ActualizarTorneo(torneo);
        }

        public async Task<bool> EliminarTorneo(string idTorneo, string nombreUsuario)
        {
            var torneo = await _torneosDA.ObtenerTorneoPorId(idTorneo);
            if (torneo == null)
            {
                throw new ArgumentException("El torneo no existe");
            }

            if (torneo.CreadoPor != nombreUsuario)
            {
                throw new UnauthorizedAccessException("No tienes permisos para eliminar este torneo");
            }

            // No permitir eliminar torneos que ya iniciaron o finalizaron
            if (torneo.Estado == EstadoTorneo.EnCurso || torneo.Estado == EstadoTorneo.Finalizado)
            {
                throw new ArgumentException("No se puede eliminar un torneo que ya inició o finalizó");
            }

            return await _torneosDA.EliminarTorneo(idTorneo);
        }

        public async Task<RespuestaTorneo?> ObtenerTorneoPorId(string idTorneo)
        {
            return await _torneosDA.ObtenerTorneoPorId(idTorneo);
        }

        public async Task<RespuestaListaTorneos> ObtenerTorneos(int numeroPagina = 1, int tamanoPagina = 10, EstadoTorneo? estado = null, string? tipoDeporte = null)
        {
            if (numeroPagina < 1) numeroPagina = 1;
            if (tamanoPagina < 1 || tamanoPagina > 100) tamanoPagina = 10;

            return await _torneosDA.ObtenerTorneos(numeroPagina, tamanoPagina, estado, tipoDeporte);
        }

        public async Task<List<RespuestaTorneo>> ObtenerMisTorneos(string nombreUsuario)
        {
            return await _torneosDA.ObtenerTorneosPorCreador(nombreUsuario);
        }

        public async Task<bool> CambiarEstadoTorneo(string idTorneo, EstadoTorneo estado, string nombreUsuario)
        {
            var torneo = await _torneosDA.ObtenerTorneoPorId(idTorneo);
            if (torneo == null)
            {
                throw new ArgumentException("El torneo no existe");
            }

            if (torneo.CreadoPor != nombreUsuario)
            {
                throw new UnauthorizedAccessException("No tienes permisos para cambiar el estado de este torneo");
            }

            if (!ValidarCambioEstado(torneo.Estado, estado))
            {
                throw new ArgumentException("Cambio de estado no válido");
            }

            return await _torneosDA.ActualizarEstadoTorneo(idTorneo, estado);
        }

        private static bool ValidarCambioEstado(EstadoTorneo estadoActual, EstadoTorneo nuevoEstado)
        {
            // Definir las transiciones válidas de estado
            return estadoActual switch
            {
                EstadoTorneo.Abierto => nuevoEstado == EstadoTorneo.EnCurso || nuevoEstado == EstadoTorneo.Cancelado,
                EstadoTorneo.EnCurso => nuevoEstado == EstadoTorneo.Finalizado || nuevoEstado == EstadoTorneo.Cancelado,
                EstadoTorneo.Finalizado => false, // No se puede cambiar desde finalizado
                EstadoTorneo.Cancelado => false, // No se puede cambiar desde cancelado
                _ => false
            };
        }
    }
}
