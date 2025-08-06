using Abstracciones.Modelos;
using Microsoft.AspNetCore.Mvc;

namespace Abstracciones.Interfaces.API
{
    public interface ITorneosController
    {
        Task<ActionResult> CrearTorneo(SolicitudCrearTorneo solicitud);
        Task<ActionResult> ActualizarPuntaje(SolicitudActualizarPuntaje solicitud);
        Task<ActionResult> AvanzarRonda(SolicitudAvanzarRonda solicitud);
        Task<ActionResult> ObtenerMisTorneos(int estado = 0);
        Task<ActionResult> AccederConClave(SolicitudAccesoConClave solicitud);
        Task<ActionResult> ObtenerTorneo(string idTorneo, string? accessKey = null);
        Task<ActionResult> ObtenerTorneos(int numeroPagina = 1, int tamanoPagina = 10, int estado = 0, string? tipoDeporte = null);
        Task<ActionResult> EliminarTorneo(string idTorneo);
        Task<ActionResult> CambiarEstadoTorneo(SolicitudCambiarEstado solicitud);
        Task<ActionResult> ObtenerTorneoPorId(string idTorneo);
        Task<ActionResult> ObtenerCategorias();
        Task<ActionResult> ObtenerDeportes();
        Task<ActionResult> AgregarJugadorATorneo(string idTorneo, int numeroPartido, Equipo equipo, string fase);


    }
}