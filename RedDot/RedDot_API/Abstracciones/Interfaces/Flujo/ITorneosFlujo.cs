using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.Flujo
{
    public interface ITorneosFlujo
    {
        Task<RespuestaTorneo> CrearTorneo(SolicitudCrearTorneo solicitud);
        Task<bool> ActualizarPuntajePartido(SolicitudActualizarPuntaje solicitud, string nombreUsuario);
        Task<bool> AvanzarRonda(SolicitudAvanzarRonda solicitud, string nombreUsuario);
        Task<List<RespuestaTorneo>> ObtenerMisTorneos(string nombreUsuario, int estado = 0);
        Task<RespuestaTorneo?> AccederTorneoConClave(string accessKey, string nombreUsuario);
        Task<RespuestaTorneo?> ObtenerTorneoPorId(string idTorneo, string nombreUsuario, string? accessKey = null);
        Task<RespuestaListaTorneos> ObtenerTorneos(string id, int numeroPagina = 1, int tamanoPagina = 10, int estado = 0, string? tipoDeporte = null);
        Task<bool> CambiarEstadoTorneo(string idTorneo, int estado, string nombreUsuario);
        Task<bool> EliminarTorneo(string idTorneo, string nombreUsuario);
        Task<RespuestaTorneo?> ObtenerTorneoPorId(string idTorneo);
        Task<bool> AgregarJugadorATorneo(string idTorneo, int numeroPartido, Equipo equipo, string fase);

        Task<bool> ModificarPuntuacionParticipante(string idTorneo, string ronda, int numeroPartido, string idJugador, int nuevaPuntuacion);
        Task<bool> ActualizarMatch(MatchChangeRequest matchStatus);

    }
}