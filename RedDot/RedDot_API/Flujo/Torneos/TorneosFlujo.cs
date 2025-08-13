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

        public async Task<RespuestaTorneo> CrearTorneo(SolicitudCrearTorneo solicitud)
        {


            var Torneo = await _torneosDA.CrearTorneo(solicitud);

            if (Torneo==null)
            {
                throw new Exception("Error al crear el torneo en la base de datos");
            }

            return Torneo ?? throw new Exception("Error al recuperar el torneo creado");
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

           

            

          

           

            return await _torneosDA.ActualizarPuntajePartido(
                solicitud.IdTorneo,
                solicitud.Ronda,
                solicitud.IndicePartido,
                solicitud.Participantes,
                solicitud.match);
        }

        public async Task<List<RespuestaTorneo>> ObtenerMisTorneos(string nombreUsuario, int estado = 0)
        {
            return await _torneosDA.ObtenerTorneosPorUsuario(nombreUsuario, estado);
        }

        public async Task<RespuestaTorneo?> AccederTorneoConClave(string accessKey, string usuario)
        {
            var torneo = await _torneosDA.ObtenerTorneoPorAccessKey(accessKey, usuario);
            if (torneo == null)
            {
                return null;
            }

            torneo.TieneAcceso = true;
            torneo.EsCreador = torneo.CreadoPor == usuario;

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


            if (!esCreador)
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

        public async Task<List<RespuestaTorneo>> ObtenerTorneosParticipando(string idUsuario, int estado = 0)
        {
            return await _torneosDA.ObtenerTorneosParticipando(idUsuario, estado);
        }

        public async Task<bool> ActualizarMatch(MatchChangeRequest matchStatus)
        {
            return await _torneosDA.ActualizarMatch(matchStatus);
        }

        public async Task<RespuestaListaTorneos> TorneosActivos()
        {
            return await _torneosDA.TorneosActivos();
        }
    }

}