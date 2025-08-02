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

        public async Task<RespuestaTorneoEliminacion> CrearTorneoEliminacion(SolicitudCrearTorneoEliminacion solicitud, string creadoPor)
        {
            if (solicitud.ParticipantesIds.Count != 8)
            {
                throw new ArgumentException("Los torneos de eliminación directa requieren exactamente 8 participantes");
            }

            if (solicitud.ParticipantesIds.Distinct().Count() != 8)
            {
                throw new ArgumentException("No se permiten participantes duplicados");
            }

            var idTorneo = await _torneosDA.CrearTorneoEliminacion(solicitud, creadoPor);

            if (string.IsNullOrEmpty(idTorneo))
            {
                throw new Exception("Error al crear el torneo en la base de datos");
            }

            var torneoCreado = await _torneosDA.ObtenerTorneoEliminacionPorId(idTorneo);
            return torneoCreado ?? throw new Exception("Error al recuperar el torneo creado");
        }

        public async Task<bool> ActualizarPuntajePartido(SolicitudActualizarPuntaje solicitud, string nombreUsuario)
        {
            var torneo = await _torneosDA.ObtenerTorneoEliminacionPorId(solicitud.IdTorneo);
            if (torneo == null)
            {
                throw new ArgumentException("El torneo no existe");
            }

            if (torneo.CreadoPor != nombreUsuario)
            {
                throw new UnauthorizedAccessException("Solo el creador del torneo puede actualizar puntajes");
            }

            if (torneo.Estado != EstadoTorneo.EnProgreso && torneo.Estado != EstadoTorneo.PorIniciar)
            {
                throw new ArgumentException("No se pueden actualizar puntajes en un torneo terminado o cancelado");
            }

            if (!EsRondaValida(solicitud.Ronda, solicitud.IndicePartido))
            {
                throw new ArgumentException("Ronda o índice de partido inválido");
            }

            if (!ValidarParticipantesPartido(torneo, solicitud.Ronda, solicitud.IndicePartido, solicitud.Participantes))
            {
                throw new ArgumentException("Los participantes no corresponden al partido especificado");
            }

            if (torneo.Estado == EstadoTorneo.PorIniciar)
            {
                await _torneosDA.ActualizarEstadoTorneo(solicitud.IdTorneo, EstadoTorneo.EnProgreso);
            }

            return await _torneosDA.ActualizarPuntajePartido(
                solicitud.IdTorneo,
                solicitud.Ronda,
                solicitud.IndicePartido,
                solicitud.Participantes);
        }

        public async Task<bool> AvanzarRonda(SolicitudAvanzarRonda solicitud, string nombreUsuario)
        {
            var torneo = await _torneosDA.ObtenerTorneoEliminacionPorId(solicitud.IdTorneo);
            if (torneo == null)
            {
                throw new ArgumentException("El torneo no existe");
            }

            if (torneo.CreadoPor != nombreUsuario)
            {
                throw new UnauthorizedAccessException("Solo el creador del torneo puede avanzar rondas");
            }

            if (torneo.Estado != EstadoTorneo.EnProgreso)
            {
                throw new ArgumentException("El torneo debe estar en progreso para avanzar rondas");
            }

            if (!ValidarRondaCompleta(torneo, solicitud.RondaActual))
            {
                throw new ArgumentException($"No todos los partidos de {solicitud.RondaActual} están completos");
            }

            if (solicitud.RondaActual == "final")
            {
                await _torneosDA.ActualizarEstadoTorneo(solicitud.IdTorneo, EstadoTorneo.Terminado);
            }

            return await _torneosDA.AvanzarRondaTorneo(solicitud.IdTorneo, solicitud.RondaActual);
        }

        public async Task<List<RespuestaTorneoEliminacion>> ObtenerMisTorneosEliminacion(string nombreUsuario, EstadoTorneo? estado = null)
        {
            return await _torneosDA.ObtenerTorneosEliminacionPorUsuario(nombreUsuario, estado);
        }

        public async Task<RespuestaTorneoEliminacion?> AccederTorneoConClave(string accessKey, string nombreUsuario)
        {
            var torneo = await _torneosDA.ObtenerTorneoPorAccessKey(accessKey);
            if (torneo == null)
            {
                return null;
            }

            torneo.TieneAcceso = true;
            torneo.EsCreador = torneo.CreadoPor == nombreUsuario;

            if (!torneo.EsCreador)
            {
                torneo.AccessKey = null;
            }

            return torneo;
        }

        public async Task<RespuestaTorneoEliminacion?> ObtenerTorneoEliminacion(string idTorneo, string nombreUsuario, string? accessKey = null)
        {
            var torneo = await _torneosDA.ObtenerTorneoEliminacionPorId(idTorneo);
            if (torneo == null)
            {
                return null;
            }

            var esCreador = torneo.CreadoPor == nombreUsuario;
            var esParticipante = torneo.Participantes.Contains(nombreUsuario);
            var tieneAccesoConClave = !string.IsNullOrEmpty(accessKey) && torneo.AccessKey == accessKey;

            if (!esCreador && !esParticipante && !tieneAccesoConClave)
            {
                throw new UnauthorizedAccessException("No tienes permisos para acceder a este torneo");
            }

            torneo.EsCreador = esCreador;
            torneo.TieneAcceso = true;

            if (!esCreador)
            {
                torneo.AccessKey = null;
            }

            return torneo;
        }


        private static bool EsRondaValida(string ronda, int indicePartido)
        {
            return ronda switch
            {
                "cuartos" => indicePartido >= 0 && indicePartido < 4,
                "semis" => indicePartido >= 0 && indicePartido < 2,
                "final" => indicePartido == 0,
                _ => false
            };
        }

        private static bool ValidarParticipantesPartido(RespuestaTorneoEliminacion torneo, string ronda, int indicePartido, List<Participante> participantes)
        {
            if (participantes.Count != 2)
                return false;

            var partidos = ronda switch
            {
                "cuartos" => torneo.Rondas.Cuartos,
                "semis" => torneo.Rondas.Semis,
                "final" => torneo.Rondas.Final,
                _ => null
            };

            if (partidos == null || indicePartido >= partidos.Count)
                return false;

            var partidoActual = partidos[indicePartido];
            return partidoActual.Participantes.Count == 2 &&
                   partidoActual.Participantes.All(p => participantes.Any(np => np.IdJugador == p.IdJugador));
        }

        private static bool ValidarRondaCompleta(RespuestaTorneoEliminacion torneo, string ronda)
        {
            var partidos = ronda switch
            {
                "cuartos" => torneo.Rondas.Cuartos,
                "semis" => torneo.Rondas.Semis,
                "final" => torneo.Rondas.Final,
                _ => null
            };

            return partidos?.All(p => p.Completado) ?? false;
        }

        private static List<string> ObtenerGanadoresRonda(List<Partido> partidos)
        {
            return partidos
                .Where(p => p.Completado)
                .Select(p => p.Participantes.First(part => part.IsWinner).IdJugador)
                .ToList();
        }


        public async Task<string> CrearTorneo(SolicitudCrearTorneo torneo, string creadoPor)
        {
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
            var torneoExistente = await _torneosDA.ObtenerTorneoPorId(torneo.Id);
            if (torneoExistente == null)
            {
                throw new ArgumentException("El torneo no existe");
            }

            if (torneoExistente.CreadoPor != nombreUsuario)
            {
                throw new UnauthorizedAccessException("No tienes permisos para modificar este torneo");
            }

            if (torneo.FechaFin <= torneo.FechaInicio)
            {
                throw new ArgumentException("La fecha de fin debe ser posterior a la fecha de inicio");
            }

            if (torneo.FechaLimiteInscripcion >= torneo.FechaInicio)
            {
                throw new ArgumentException("La fecha límite de inscripción debe ser anterior a la fecha de inicio");
            }

            if (torneo.CuposMaximos < torneoExistente.Participantes.Count)
            {
                throw new ArgumentException($"No puedes reducir el máximo de participantes por debajo del número actual ({torneoExistente.Participantes.Count})");
            }

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

            if (torneo.Estado == EstadoTorneo.EnProgreso || torneo.Estado == EstadoTorneo.Terminado)
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
            return estadoActual switch
            {
                EstadoTorneo.PorIniciar => nuevoEstado == EstadoTorneo.EnProgreso || nuevoEstado == EstadoTorneo.Cancelado,
                EstadoTorneo.EnProgreso => nuevoEstado == EstadoTorneo.Terminado || nuevoEstado == EstadoTorneo.Cancelado,
                EstadoTorneo.Terminado => false,
                EstadoTorneo.Cancelado => false,
                _ => false
            };
        }

        public async Task<bool> AgregarParticipantes(ParticipantesBase Participantes, string idTorneo)
        {
            var torneoExistente = await _torneosDA.ObtenerTorneoPorId(idTorneo);
            if (torneoExistente == null)
            {
                throw new ArgumentException("El torneo no existe");
            }
            if (torneoExistente.CuposMaximos == torneoExistente.Participantes.Count)
            {
                throw new ArgumentException($"Limite de cupos alcanzado ({torneoExistente.Participantes.Count})");
            }
            return await _torneosDA.AgregarParticipantes(Participantes, idTorneo);
        }

        public async Task<bool> EliminarMienbroEquipo(string idTorneo, string NombreEquipo, string idUsuario)
        {
            var torneoExistente = await _torneosDA.ObtenerTorneoPorId(idTorneo);
            if (torneoExistente == null)
            {
                throw new ArgumentException("El torneo no existe");
            }
            return await _torneosDA.EliminarMienbroEquipo(idTorneo, NombreEquipo, idUsuario);
        }

        public async Task<bool> EliminarEquipo(string idTorneo, string NombreEquipo)
        {
            var torneoExistente = await _torneosDA.ObtenerTorneoPorId(idTorneo);
            if (torneoExistente == null)
            {
                throw new ArgumentException("El torneo no existe");
            }
            return await _torneosDA.EliminarEquipo(idTorneo, NombreEquipo);
        }

        public async Task<bool> EliminarParticipante(string idTorneo, string IdUsuario)
        {
            var torneoExistente = await _torneosDA.ObtenerTorneoPorId(idTorneo);
            if (torneoExistente == null)
            {
                throw new ArgumentException("El torneo no existe");
            }
            return await _torneosDA.EliminarParticipante(idTorneo, IdUsuario);
        }

        public async Task<LeaderBoardPorTorneo> LeaderBoardPorTorneo(string idTorneo)
        {
            var torneoExistente = await _torneosDA.ObtenerTorneoPorId(idTorneo);
            if (torneoExistente == null)
            {
                throw new ArgumentException("El torneo no existe");
            }
            return await _torneosDA.LeaderBoardPorTorneo(idTorneo);
        }
    }
}