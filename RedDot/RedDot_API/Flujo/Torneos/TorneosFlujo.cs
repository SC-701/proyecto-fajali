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

        // MÉTODO PRINCIPAL - Crear Torneo (siempre de eliminación)
        public async Task<RespuestaTorneo> CrearTorneo(SolicitudCrearTorneo solicitud)
        {
           

            var idTorneo = await _torneosDA.CrearTorneo(solicitud);

            if (string.IsNullOrEmpty(idTorneo))
            {
                throw new Exception("Error al crear el torneo en la base de datos");
            }

            var torneoCreado = await _torneosDA.ObtenerTorneoPorId(idTorneo);
            return torneoCreado ?? throw new Exception("Error al recuperar el torneo creado");
        }

        public async Task<bool> ActualizarPuntajePartido(SolicitudActualizarPuntaje solicitud, string nombreUsuario)
        {
            var torneo = await _torneosDA.ObtenerTorneoPorId(solicitud.IdTorneo);
            if (torneo == null)
            {
                throw new ArgumentException("El torneo no existe");
            }

            if (torneo.CreadoPor != nombreUsuario)
            {
                throw new UnauthorizedAccessException("Solo el creador del torneo puede actualizar puntajes");
            }

            if (torneo.Estado != 2 && torneo.Estado != 0)
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

            if (torneo.Estado == 0)
            {
                await _torneosDA.ActualizarEstadoTorneo(solicitud.IdTorneo, 1);
            }

            return await _torneosDA.ActualizarPuntajePartido(
                solicitud.IdTorneo,
                solicitud.Ronda,
                solicitud.IndicePartido,
                solicitud.Participantes);
        }

        public async Task<bool> AvanzarRonda(SolicitudAvanzarRonda solicitud, string nombreUsuario)
        {
            var torneo = await _torneosDA.ObtenerTorneoPorId(solicitud.IdTorneo);
            if (torneo == null)
            {
                throw new ArgumentException("El torneo no existe");
            }

            if (torneo.CreadoPor != nombreUsuario)
            {
                throw new UnauthorizedAccessException("Solo el creador del torneo puede avanzar rondas");
            }

            if (torneo.Estado != 1)
            {
                throw new ArgumentException("El torneo debe estar en progreso para avanzar rondas");
            }

            if (!ValidarRondaCompleta(torneo, solicitud.RondaActual))
            {
                throw new ArgumentException($"No todos los partidos de {solicitud.RondaActual} están completos");
            }

            if (solicitud.RondaActual == "final")
            {
                await _torneosDA.ActualizarEstadoTorneo(solicitud.IdTorneo, 3);
            }

            return await _torneosDA.AvanzarRondaTorneo(solicitud.IdTorneo, solicitud.RondaActual);
        }

        public async Task<List<RespuestaTorneo>> ObtenerMisTorneos(string nombreUsuario, int estado = 0)
        {
            return await _torneosDA.ObtenerTorneosPorUsuario(nombreUsuario, estado);
        }

        public async Task<RespuestaTorneo?> AccederTorneoConClave(string accessKey, string nombreUsuario)
        {
            var torneo = await _torneosDA.ObtenerTorneoPorAccessKey(accessKey, nombreUsuario);
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

        public async Task<RespuestaTorneo?> ObtenerTorneoPorId(string idTorneo, string nombreUsuario, string? accessKey = null)
        {
            var torneo = await _torneosDA.ObtenerTorneoPorId(idTorneo);
            if (torneo == null)
            {
                return null;
            }

            var esCreador = torneo.CreadoPor == nombreUsuario;
           

            if (!esCreador  )
            {
                return torneo;
            }

            torneo.EsCreador = esCreador;
            torneo.TieneAcceso = true;

            if (!esCreador)
            {
                torneo.AccessKey = null;
            }

            return torneo;
        }

        public async Task<RespuestaListaTorneos> ObtenerTorneos(string id, int numeroPagina = 1, int tamanoPagina = 10, int estado = 0, string? tipoDeporte = null)
        {
            if (numeroPagina < 1) numeroPagina = 1;
            if (tamanoPagina < 1 || tamanoPagina > 100) tamanoPagina = 10;

            return await _torneosDA.ObtenerTorneos(id, numeroPagina, tamanoPagina, estado, tipoDeporte);
        }

        public async Task<bool> CambiarEstadoTorneo(string idTorneo, int estado, string nombreUsuario)
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


            if (
                torneo.Participantes.Count != 8)
            {
                throw new ArgumentException("No se puede iniciar un torneo con menos de 8 participantes");
            }

            return await _torneosDA.ActualizarEstadoTorneo(idTorneo, estado);
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

            if (torneo.Estado == 1 || torneo.Estado == 3)
            {
                throw new ArgumentException("No se puede eliminar un torneo que ya inició o finalizó");
            }

            return await _torneosDA.EliminarTorneo(idTorneo);
        }



        public async Task<RespuestaTorneo?> ObtenerTorneoPorId(string idTorneo)
        {
            return await _torneosDA.ObtenerTorneoPorId(idTorneo);
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

        private static bool ValidarParticipantesPartido(RespuestaTorneo torneo, string ronda, int indicePartido, List<Participante> participantes)
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

        private static bool ValidarRondaCompleta(RespuestaTorneo torneo, string ronda)
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

      

        public Task<bool> AgregarJugadorATorneo(string idTorneo, int numeroPartido, Equipo equipo, string fase)
        {
            return _torneosDA.AgregarJugadorATorneo(idTorneo, numeroPartido, equipo,fase);
        }

        public Task<bool> ModificarPuntuacionParticipante(string idTorneo, string ronda, int numeroPartido, string idJugador, int nuevaPuntuacion)
        {
           return _torneosDA.ModificarPuntuacionParticipante(idTorneo, ronda, numeroPartido, idJugador, nuevaPuntuacion);
        }

        public async Task<bool> ActualizarMatch(MatchChangeRequest matchStatus)
        {
            return await _torneosDA.ActualizarMatch( matchStatus);
        }
    }
}